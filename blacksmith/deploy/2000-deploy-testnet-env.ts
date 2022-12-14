import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { 
    defaultLendingPairInitVars,
    deployTestTokensAndMock,
    makeLendingPairTestSuiteVars,
    setupLendingPair
} from '../test/lib';
import { BigNumber, Contract } from 'ethers';
import { ContractId } from '../helpers/types';
import { LendingPairFactory } from '../types';
import { getFeeWithdrawalProxy, getPriceOracleAggregatorProxy, getVaultProxy } from '../helpers/contracts';

const tag = `testnet`

const deployTestnet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (!process.env.DEPLOY_TESTNET) return

    const { deployments: { deploy, get, save }, getNamedAccounts, ethers } = hre;
    const { deployer, blackSmithTeam } = await getNamedAccounts();

    const BorrowAssetMockPriceOracle = await deploy('BorrowAssetMockPriceOracle', {
        contract: ContractId.MockPriceOracle,
        from: deployer,
        args: [BigNumber.from(10).pow(8).toString()]
    })

    const CollateralAssetMockPriceOracle = await deploy('CollateralAssetMockPriceOracle', {
        contract: ContractId.MockPriceOracle,
        from: deployer,
        args: [BigNumber.from(10).pow(8).toString()]
    })

    const BorrowAsset = await deploy('BorrowAsset', {
        contract: ContractId.MockToken,
        args: [18],
        from: deployer,
    });

    const CollateralAsset = await deploy('CollateralAsset', {
        contract: ContractId.MockToken,
        args: [18],
        from: deployer
    });

    const vars = await makeLendingPairTestSuiteVars({});

    const irParams = {
        baseRatePerYear: "30000000000000000",
        multiplierPerYear: "52222222222200000",
        jumpMultiplierPerYear: "70",
        optimal: "1000000000000000000",
        blocksPerYear: "2102400",
        borrowRateMaxMantissa: BigNumber.from(5).mul(BigNumber.from(10).pow(13)).toString()
    }
    const teamSigner = await ethers.getSigner(blackSmithTeam)
    const irTx = await (await vars.LendingPairFactory.connect(teamSigner).createIR(
        irParams,
        blackSmithTeam
    )).wait();
    const modelEv = irTx.events?.find(x => x.event === 'NewInterestRateModel')
    const liquidationFee = BigNumber.from(5).mul(BigNumber.from(10).pow(16))
    const collateralFactor = BigNumber.from(15).mul(BigNumber.from(10).pow(17))
    
    // set price oracles
    const priceProxy = await getPriceOracleAggregatorProxy()
    const vaultProxy = await getVaultProxy()
    const feeWithdrawalProxy = await getFeeWithdrawalProxy()
    
    await priceProxy.connect(teamSigner).updateOracleForAsset(
        BorrowAsset.address,
        BorrowAssetMockPriceOracle.address
    ).catch(e => console.log(e))

    await priceProxy.connect(teamSigner).updateOracleForAsset(
        CollateralAsset.address,
        CollateralAssetMockPriceOracle.address
    )

    // use lending pair factory to create a lending pair
    const newLendingPairTx = await (await vars.LendingPairFactory.createLendingPairWithProxy(
        "DEMO",
        "DST",
        blackSmithTeam,
        CollateralAsset.address,
        {
            borrowAsset: BorrowAsset.address,
            initialExchangeRateMantissa: "1000000000000000000",
            reserveFactorMantissa: "500000000000000000",
            collateralFactor,
            liquidationFee,
            interestRateModel: modelEv!.args!.ir
        },
    )).wait();

    const newLendingPairEv = newLendingPairTx.events?.find(x => x.event === 'NewLendingPair')

    console.log("\n\n\n")
    console.log("========================= dev environment deploy ================================")
    console.log(`Vault: ${vars.Vault.address}`)
    console.log(`VaultProxy: ${vaultProxy.address}`)
    console.log(`VaultFactory: ${vars.VaultFactory.address}`)
    console.log(`LendingPairFactory: ${vars.LendingPairFactory.address}`)
    console.log(`LendingPairHelper: ${vars.LendingPairHelper.address}`)
    console.log(`FeeWithdrawal: ${vars.FeeWithdrawal.address}`)
    console.log(`FeeWithdrawalProxy: ${feeWithdrawalProxy.address}`)
    console.log(`PriceOracleAggregator: ${vars.PriceOracleAggregator.address}`)
    console.log(`PriceOracleAggregatorProxy: ${priceProxy.address}`)
    console.log(`LendingPair: ${vars.LendingPair.address}`)
    console.log(`------- Test Lending Pair ----------------------`)
    console.log(`LendingPair: ${newLendingPairEv!.args!.pair}`)
    console.log(`   DebtToken: ${vars.DebtToken.address}`)
    console.log(`   CollateralToken: ${CollateralAsset.address}`)
    console.log(`   BorrowToken: ${BorrowAsset.address}`)
    console.log(`   CollateralWrapperToken: ${vars.CollateralWrapperToken.address}`)
    console.log(`   BorrowWrapperToken: ${vars.BorrowWrapperToken.address}`)

    console.log("=================================================================================")
    console.log("\n")

}

export default deployTestnet
deployTestnet.tags = [`${tag}`]
deployTestnet.dependencies = [ContractId.LendingPairFactory]
deployTestnet.runAtTheEnd = true;
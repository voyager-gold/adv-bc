import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";

describe("DateString", () => {
  let dateTester: Contract;

  before(async () => {
    const dateTesterFactory = await ethers.getContractFactory("TestDate");
    dateTester = await dateTesterFactory.deploy();
  });

  // We test the encoding function
  it("Encodes a JAN timestamp right", async () => {
    const testTimestamp = 1610801378;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-JAN-21-GMT");
  });

  it("Encodes a FEB timestamp right", async () => {
    const testTimestamp = 1613479778;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-FEB-21-GMT");
  });

  it("Encodes a MAR timestamp right", async () => {
    const testTimestamp = 1615895378;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-MAR-21-GMT");
  });

  it("Encodes a APR timestamp right", async () => {
    const testTimestamp = 1618573778;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-APR-21-GMT");
  });

  it("Encodes a MAY timestamp right", async () => {
    const testTimestamp = 1621165778;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-MAY-21-GMT");
  });

  it("Encodes a JUN timestamp right", async () => {
    const testTimestamp = 1623844178;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-JUN-21-GMT");
  });

  it("Encodes a JUL timestamp right", async () => {
    const testTimestamp = 1626436178;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-JUL-21-GMT");
  });

  it("Encodes a AUG timestamp right", async () => {
    const testTimestamp = 1629114578;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-AUG-21-GMT");
  });

  it("Encodes a SEP timestamp right", async () => {
    const testTimestamp = 1631792978;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-SEP-21-GMT");
  });

  it("Encodes a OCT timestamp right", async () => {
    const testTimestamp = 1634384978;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-OCT-21-GMT");
  });

  it("Encodes a NOV timestamp right", async () => {
    const testTimestamp = 1637066978;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-NOV-21-GMT");
  });

  it("Encodes a DEC timestamp right", async () => {
    const testTimestamp = 1639658978;
    const encoded = await dateTester.callStatic.encodeTimestamp(testTimestamp);
    expect(encoded).to.be.eq("Tester16-DEC-21-GMT");
  });

  // We test the encoding and writing function
  it("Encodes a timestamp and writes a prefix correctly", async () => {
    const testTimestamp = 1613479778;
    const encoded = await dateTester.callStatic.encodePrefixTimestamp(
      ":YUSDC",
      testTimestamp
    );
    expect(encoded).to.be.eq("Tester:YUSDC:16-FEB-21-GMT");
  });
});

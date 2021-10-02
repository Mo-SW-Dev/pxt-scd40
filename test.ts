//Blocks Test
basic.forever(function () {
    serial.writeLine("" + (SCD40.readCO2()))
    serial.writeLine("" + (SCD40.readTemperature()))
    serial.writeLine("" + (SCD40.readHumidity()))
    basic.pause(1000)
})

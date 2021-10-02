/**
 * SCD40 block
 */
//%color=#444444 icon="\uf185" block="SCD40"
namespace SCD40 {
    
    let temperature: number = 0
    let humidity: number = 0
    let co2: number = 0

    const sensorAddress = 0x62
    
    control.inBackground(() => {
        enableContinuousMeasurement()
        while (true) {
            readMeasurement()
        }
    })
    
    function enableContinuousMeasurement(): void{
        pins.i2cWriteNumber(sensorAddress, 0x21b1, NumberFormat.UInt16BE,false)
    }

    function readReady(): boolean{
        let buf = pins.createBuffer(3)
        pins.i2cWriteNumber(sensorAddress, 0xe4b8, NumberFormat.UInt16BE,false)
        basic.pause(10)
        buf = pins.i2cReadBuffer(sensorAddress, 3, false)
        let res = buf[0]<<8 + buf[1]
        //serial.writeLine("readReady: " + res)

        if(res != 0x8000){
            return true
        }else{
            return false
        }
    }

    function readMeasurement(): void{
        while(readReady() == false){
            //serial.writeLine("waiting in: readMeasurement()")
        }
        let buf = pins.createBuffer(9)
        let tbuf = pins.createBuffer(4)
        pins.i2cWriteNumber(sensorAddress, 0xec05, NumberFormat.UInt16BE, false)
        basic.pause(10)
        buf = pins.i2cReadBuffer(sensorAddress, 9, false)
        
        //co2
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 0))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 1))
        co2 = tbuf.getNumber(NumberFormat.UInt16BE, 0)
        //serial.writeLine("co2: " + co2)

        //temperature
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 3))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 4))
        temperature = tbuf.getNumber(NumberFormat.UInt16BE, 0)
        //temperature = Math.round(temperature*100)/100
        temperature = Math.roundWithPrecision(-45 + 175 * temperature/65536, 2 )
        //serial.writeLine("temperature: " + temperature)

        //humidity
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 6))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 7))
        humidity = tbuf.getNumber(NumberFormat.UInt16BE, 0)
        humidity = Math.roundWithPrecision((humidity*100)/65536,2) 
        //serial.writeLine("humidity: " + humidity)
    }

    /**
     * Reads CO2
     */
    //% weight=87 blockGap=8
    //% block="Read CO2" 
    //% blockId=read_CO2
    export function readCO2(): number{
        return co2
    }

    /**
     * Reads Temperature
     */
    //% weight=87 blockGap=8
    //% block="Read Temperature" 
    //% blockId=read_Temperature
    export function readTemperature(): number{
        return temperature
    }

    /**
     * Reads Humidity
     */
    //% weight=87 blockGap=8
    //% block="Read Humidity" 
    //% blockId=read_Humidity
    export function readHumidity(): number{
        return humidity
    }
} 
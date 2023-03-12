const Verify = require('../models/verifyModel')

const generateVerifyCode = (numberOfDigits) => {
    const n = parseInt(numberOfDigits)
    const number = Math.floor(Math.random() * Math.pow(10, n)) + 1
    let numberStr = number.toString()
    const l = numberStr.length
    for (let i = 0; i < 6 - l; ++i) {
        numberStr = '0' + numberStr
    }
    return numberStr
}

const isVerifyEmail = async (email, verifyCode) => {
    try {
        const res = await Verify.findOne({ email })
        if (res) {
            const { code, dateCreated } = res
            if (code !== verifyCode) return false
            const now = Date.now()
            if (now - dateCreated > 10 * 60 * 1000) //10 mins
                return false
            return true
        }
        return false
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = { generateVerifyCode, isVerifyEmail }
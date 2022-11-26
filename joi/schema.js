const joi = require('@hapi/joi');

const nameSchema = joi.object({
    name:joi.string().min(3).required()
})

module.exports = nameSchema
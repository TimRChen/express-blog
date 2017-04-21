const mongoose = require('mongoose');
const bcrypt = require('bcrypt');   // screat stronger
const sr = 10;

const Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: {
        unique: true,
        type: String,
    },
    password: {
        unique: true,
        type: String,
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now(),
        },
        updateAt: {
            type: Date,
            default: Date.now(),
        }
    }
});


UserSchema.pre('save', function(next) {
    let user = this;
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    // add salt
    bcrypt.genSalt(sr, function(err, salt) {
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
    next();
});

UserSchema.methods = {
    // 密码校对
    comparePassword: function(_password, cb) {
        bcrypt.compare(_password, this.password, function(err, isMatch) {
            if (err) return cb(err);

            cb(null, isMatch);
        });
    }  
};


// 定义静态方法
UserSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})   // 取出所有数据
            .sort('meta.updateAt')
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})     // 查找单条数据
            .exec(cb);
    },
};


module.exports = UserSchema;
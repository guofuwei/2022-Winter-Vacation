const express = require("express")
const router = express.Router()
const mysql = require("mysql")
const config = require("../../config/config")
const connection = mysql.createConnection(config.mysqlConfig)
connection.connect(function (err) {
    if (!err) {
        console.log("MANAGE mysql connect success!")
    }
})
const passport = require("passport")
const NameHashTable = {
    "德育": "moral_edu",
    "智育": "intellectual_edu",
    "体育": "sports_edu",
    "美育": "aesthetic_edu",
    "劳育": "labor_edu",
}

// @route GET api/manage/test
// @desc 返回是json数据
// @access public
router.get("/test", function (req, res) {
    res.json({
        "msg": "/api/manage test"
    })
})




// @route GET api/manage/
// @desc 返回是json数据
// @access private
router.get("/", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let data = []
    let depart_ids = []
    let collage_ids = []
    sql = "select depart_man.id as depart_man_id,depart_man.department,collage_man.id as collage_man_id,collage_man.collage from depart_man left join collage_man on depart_man.id=collage_man.depart_id order by depart_man.id;"
    connection.query(sql, function (err, ret) {
        if (err) {
            console.log("api/manage/ mysql get deaprtment err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL api/manage/ get department err"
            })
            return
        }
        data = ret
        for (let i = 0; i < data.length; i++) {
            data[i].depart_man_user_id = []
            data[i].depart_man_user_name = []
            data[i].collage_man_user_id = []
            data[i].collage_man_user_name = []
            data[i].depart_man_user_studentid = []
            data[i].collage_man_user_studentid = []
            depart_ids.push(data[i].depart_man_id)
            collage_ids.push(data[i].collage_man_id)
        }

        // 查找部门管理员
        sql = "select depart_man.id as depart_man_id,user_table.id as user_id,user_table.studentid,user_table.name from depart_man,user_table where depart_man.id=user_table.depart_man_id;"
        connection.query(sql, function (err, ret) {
            if (err) {
                console.log("api/manage/ mysql get user_depart_id err:" + err)
                res.json({
                    status: 10002,
                    msg: "MYSQL api/manage/ get user_depart_id err"
                })
                return
            }
            let index = -1
            let i = 0
            let j = 0;
            for (i = 0; i < ret.length; i++) {
                index = depart_ids.indexOf(ret[i].depart_man_id)
                data[index].depart_man_user_id.push(ret[i].user_id)
                data[index].depart_man_user_name.push(ret[i].name)
                data[index].depart_man_user_studentid.push(ret[i].studentid)
                for (j = index + 1; j < depart_ids.length; j++) {
                    if (depart_ids[j] === ret[i].depart_man_id) {
                        data[j].depart_man_user_id.push(ret[i].user_id)
                        data[j].depart_man_user_name.push(ret[i].name)
                        data[j].depart_man_user_studentid.push(ret[i].studentid)
                    } else {
                        break
                    }
                }
            }

            // 查找二级学院的管理员
            sql = "select collage_man.id as collage_man_id,user_table.id as user_id,user_table.studentid,user_table.name from collage_man,user_table where collage_man.id=user_table.collage_man_id;"
            connection.query(sql, function (err, ret) {
                if (err) {
                    console.log("api/manage/ mysql get user_collage_id err:" + err)
                    res.json({
                        status: 10002,
                        msg: "MYSQL api/manage/ get user_collage_id err"
                    })
                    return
                }
                let index = -1
                for (let i = 0; i < ret.length; i++) {
                    index = collage_ids.indexOf(ret[i].collage_man_id)
                    data[index].collage_man_user_id.push(ret[i].user_id)
                    data[index].collage_man_user_name.push(ret[i].name)
                    data[index].collage_man_user_studentid.push(ret[i].studentid)
                }
                res.json({
                    status: 200,
                    data: data,
                })
            })
        })
    })
})


// @route POST api/manage/add
// @desc 返回是json数据
// @access private
router.post("/add", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    if (!req.body.depart || !req.body.depart_id || !req.body.depart_id_list || !req.body.depart_list) {
        res.status(200).json({
            status: 10001,
            msg: "非法请求"
        })
    }
    let sql = "select * from collage_man where collage=?"
    connection.query(sql, [req.body.collage], function (err, ret) {
        if (err) {
            console.log("api/manage/add mysql select err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage select err"
            })
            return
        }
        if (ret != "") {
            res.json({
                status: 10015,
                msg: "该学院已存在"
            })
            return
        } else {
            sql = "insert into collage_man values(0,?,?);"
            connection.query(sql, [req.body.depart_id, req.body.collage], function (err, ret) {
                if (err) {
                    console.log("api/manage/add mysql insert err:" + err)
                    res.json({
                        status: 10002,
                        msg: "MYSQL manage insert err"
                    })
                    return
                }
                res.json({
                    status: 200,
                    msg: "ok"
                })
            })
        }
    })
})

// @route POST api/manage/add2
// @desc 返回是json数据
// @access private
router.post("/add2", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    if (!req.body.depart) {
        res.status(200).json({
            status: 10001,
            msg: "非法请求"
        })
    }
    let sql = "select * from depart_man where department=?"
    connection.query(sql, [req.body.depart], function (err, ret) {
        if (err) {
            console.log("api/manage/add2 mysql select err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage select err"
            })
            return
        }
        if (ret != "") {
            res.json({
                status: 10014,
                msg: "该部门已存在"
            })
            return
        } else {
            sql = "insert into depart_man values(0,?);"
            connection.query(sql, [req.body.depart], function (err, ret) {
                if (err) {
                    console.log("api/manage/add2 mysql insert err:" + err)
                    res.json({
                        status: 10002,
                        msg: "MYSQL manage insert err"
                    })
                    return
                }
                res.json({
                    status: 200,
                    msg: "ok"
                })
            })
        }
    })
})


// @route POST api/manage/delete/collage/:id
// @desc 返回是json数据
// @access private
router.delete("/delete/collage/:id", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let sql = "delete from collage_man where id=?"
    connection.query(sql, [req.params.id], function (err, ret) {
        if (err) {
            console.log("api/manage/delete/collage/:id mysql delete err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage delete err"
            })
            return
        }
        res.json({
            status: 200,
            msg: ""
        })
    })
})


// @route POST api/manage/delete/depart/:id
// @desc 返回是json数据
// @access private
router.delete("/delete/depart/:id", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let sql = "delete from collage_man where depart_id=?"
    connection.query(sql, [req.params.id], function (err, ret) {
        if (err) {
            console.log("api/manage/delete/depart/:id mysql delete err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage delete err"
            })
            return
        }
        sql = "delete from depart_man where id=?"
        connection.query(sql, [req.params.id], function (err, ret) {
            if (err) {
                console.log("api/manage/delete/:id mysql delete err:" + err)
                res.json({
                    status: 10002,
                    msg: "MYSQL manage delete err"
                })
                return
            }
            res.json({
                status: 200,
                msg: ""
            })
        })
    })
})





// @route DELETE api/manage/delete1/:studentid
// @desc 返回是json数据
// @access private
router.delete("/delete1/:studentid", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let sql = "update user_table set depart_man_id=0 where studentid=?;"
    connection.query(sql, [req.params.studentid], function (err, ret) {
        if (err) {
            console.log("api/manage/delete1 mysql update err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage update err"
            })
            return
        }
        res.json({
            status: 200,
            msg: ""
        })
    })
})



// @route DELETE api/manage/delete2/:studentid
// @desc 返回是json数据
// @access private
router.delete("/delete2/:studentid", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let sql = "update user_table set collage_man_id=0 where studentid=?;"
    connection.query(sql, [req.params.studentid], function (err, ret) {
        if (err) {
            console.log("api/manage/delete1 mysql update err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage update err"
            })
            return
        }
        res.json({
            status: 200,
            msg: ""
        })
    })
})


// @route DELETE api/manage/delete2/:studentid
// @desc 返回是json数据
// @access private
router.delete("/delete2/:studentid", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    let sql = "update user_table set collage_man_id=0 where studentid=?;"
    connection.query(sql, [req.params.studentid], function (err, ret) {
        if (err) {
            console.log("api/manage/delete1 mysql update err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage update err"
            })
            return
        }
        res.json({
            status: 200,
            msg: ""
        })
    })
})


// @route POST api/manage/new/manager
// @desc 新建管理员(部门和学院)
// @access private
router.post("/new/manager", passport.authenticate("jwt", {
    session: false
}), function (req, res) {
    if (!req.body.title || !req.body.name || !req.body.studentid) {
        res.status(200).json({
            status: 10001,
            msg: "非法请求"
        })
        return
    }
    let sql = "select * from user_table where name=? and studentid=?;"
    let man_id = 0
    // 验证学号与姓名是否匹配
    connection.query(sql, [req.body.name, req.body.studentid], function (err, ret) {
        if (err) {
            console.log("api/manage/new/manager mysql select err:" + err)
            res.json({
                status: 10002,
                msg: "MYSQL manage select err"
            })
            return
        }
        if (ret == "") {
            res.json({
                status: 10016,
                msg: "学号与姓名不相符"
            })
            return
        } else {
            if (req.body.title === "新增部门管理员") {
                sql = "update user_table set depart_man_id=? where studentid=?;"
                man_id = req.body.depart_id
            } else if (req.body.title === "新增学院管理员") {
                sql = "update user_table set collage_man_id=? where studentid=?;"
                man_id = req.body.collage_id
            } else {
                res.status(200).json({
                    status: 10001,
                    msg: "非法请求"
                })
                return
            }
            connection.query(sql, [man_id, req.body.studentid], function (err, ret) {
                if (err) {
                    console.log("api/manage/new/manager mysql update err:" + err)
                    res.json({
                        status: 10002,
                        msg: "MYSQL manage update err"
                    })
                    return
                }
                res.json({
                    status: 200,
                    msg: "ok"
                })
            })
        }
    })
})






module.exports = router
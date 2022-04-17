const path = require("path");
const csv = require("csvtojson");
const Result = require("../models/result");
const Student = require("../models/student");
const Class = require("../models/class");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const uploadResult = (req, res, next) => {
  csv()
    .fromFile(req.file.path)
    .then(async (jsonobj) => {
      jsonobj.forEach(async (ele) => {
        const nameArr = ele.name.split(",");
        const marksArr = ele.marks.split(",");
        const result = nameArr.map((ele, i) => {
          return { name: ele, score: parseInt(marksArr[i]) };
        });
        delete ele.name;
        delete ele.marks;
        ele.result = result;
      });

      try {
        const results = await Result.insertMany(jsonobj);
        results.forEach(async (result) => {
          const classDoc = await Class.findById(result.class_id);
          const studentDoc = await Student.findById(result.student_id);
          classDoc.result.push(result._id);
          await classDoc.save();
          studentDoc.result.push(result._id);
          await studentDoc.save();
        });
      } catch (e) {
        return next(new HttpError("uploading failed", 500));
      }
    });
  res.redirect("/dashboard/results");
};

const uploadStudent = (req, res) => {
  csv()
    .fromFile(req.file.path)
    .then((jsonobj) => {
      console.log(jsonobj);
    });
};

exports.uploadResult = uploadResult;
exports.uploadStudent = uploadStudent;

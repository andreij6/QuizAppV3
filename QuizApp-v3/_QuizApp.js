"use strict";

var _QApp = {};

_QApp.url = "https://quizpushup.firebaseio.com/";

///----------------- Data Structures--------------

_QApp.Course = function (name) {
    this.name = name;
    this.studyGuides = [];
};

_QApp.Courses = [];

_QApp.StudyGuide = function (name) {
    this.name = name;
    this.questions = [];
};

_QApp.Question = function (question, answer) {
    this.answer = answer;
    this.question = question;
};

///------------------------------------------------
///-----------------Master AJax & Url Builder------
///------------------------------------------------


_QApp.Ajax = function (method, url, callback, data) {
    var request = new XMLHttpRequest();

    request.open(method, url, true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {

            var response = JSON.parse(this.response);
            if (callback) { callback(response); }
        } else {
            console.log("Error " + this.status);
        }
    }

    request.onerror = function () {
        console.log("Communication Error" + this.response);
    }
    if (data) {
        request.send(JSON.stringify(data));
    } else {
        request.send();
    }

};

_QApp.urlMaker = function (string) {
    var url = _QApp.url;

    if (string) {
            url += string + "/";
    }
    url += ".json";

    return url;

};

//--------------------------Course Crud-------------

_QApp.CreateCourse = function () {
    var course = document.getElementById("courseName");

    _QApp.newCourse = new _QApp.Course(course.value);

    var url = _QApp.urlMaker("Course");
    
    _QApp.Ajax("POST", url, _QApp.courseKeyArray, _QApp.newCourse);

    course.value = " ";
};

//--Create Course Callback
_QApp.courseKeyArray = function (data) {

    _QApp.newCourse.key = data.name;

    _QApp.Courses.push(_QApp.newCourse);

    _QApp.ReDraw();

    _QApp.newCourse = null;
};

//Full Get onload
_QApp.ReadCourses = function () {
    var url = _QApp.urlMaker(["Course"]);

    _QApp.Ajax("GET", url, _QApp.Draw, null);
};
//Draw on Full page load
_QApp.Draw = function (data) {
    var tbody = document.getElementById("tbody");

    for (var x in data) {
        data[x].key = x;
        data[x].studyGuides = [];

        if (data[x].studyGuides) {
            for (var y in data[x].StudyGuides) {
                data[x].StudyGuides[y].key = y;
                data[x].studyGuides.push(data[x].StudyGuides[y]);
            }
        }
        
        _QApp.Courses.push(data[x]);
    }
    console.log(_QApp.Courses);
    for( var x in _QApp.Courses)
    {
        tbody.innerHTML += "<tr><td>" + _QApp.Courses[x].name + '</td><td>' + _QApp.Courses[x].studyGuides.length + '</td><td><button type="button" class="btn btn-default" onclick="_QApp.Study(\'' + _QApp.Courses[x].key + '\')" >Study</button></td><td><button type="button" onclick="_QApp.SetupCreateSG(\'' + _QApp.Courses[x].key + '\')" data-toggle="modal" data-target="#myModal">Add Study Guide</button></td><td><button type="button" onclick="_QApp.Edit(\'' + _QApp.Courses[x].key + '\')">Edit Course</button></td><td><button type="button" onclick="_QApp.DeleteCourse(\'' + _QApp.Courses[x].key + '\')">Delete Course</button></td></tr>';
    }
    console.log(_QApp.Courses);
};

//Redraw from array once single course is added
_QApp.ReDraw = function () {
    var tbody = document.getElementById("tbody");
    tbody.innerHTML = " ";

    for (var i = 0; i < _QApp.Courses.length; i++) {
        tbody.innerHTML += "<tr><td>" + _QApp.Courses[i].name + '</td><td>' + _QApp.Courses[i].studyGuides.length + '</td><td><button type="button" class="btn btn-default" onclick="_QApp.Study(\'' + _QApp.Courses[i].key + '\')" >Study</button></td><td><button type="button" onclick="_QApp.SetupCreateSG(\'' + _QApp.Courses[i].key + '\')" data-toggle="modal" data-target="#myModal">Add Study Guide</button></td><td><button type="button" onclick="_QApp.Edit(\'' + _QApp.Courses[i].key + '\')">Edit Course</button></td><td><button type="button" onclick="_QApp.DeleteCourse(\'' + _QApp.Courses[i].key + '\')">Delete Course</button></td></tr>';
    }
    

};

_QApp.UpdateCourse = function (key) {
    var course = document.getElementById("courseName").value;

    _QApp.newCourse = new _QApp.Course(course);

    var url = _QApp.urlMaker("Course/" + key);

    for (var i = 0; i < _QApp.Courses.length; i++) {

        if (_QApp.Courses[i].key === key) {

            _QApp.Courses.splice(i, 1, _QApp.newCourse);

        }

    }

    _QApp.Ajax("PUT", url, null, _QApp.newCourse);

    document.getElementById("courseName").value = " ";

    _QApp.ReDraw();
};

_QApp.Edit = function (key) {
    var courseInput = document.getElementById("courseName");
    var courseUpdate = document.getElementById("UpdateCourse");

    for (var x in _QApp.Courses) {
        if (_QApp.Courses[x].key === key) {
            courseInput.value = _QApp.Courses[x].name;
        }
    }

    courseUpdate.setAttribute("onclick", "_QApp.UpdateCourse('" + key + "')");

};

_QApp.DeleteCourse = function (key) {
    var url = _QApp.urlMaker("Course/" + key);

    _QApp.Ajax("DELETE", url, null, true, null);

    for (var i = 0; i < _QApp.Courses.length; i++) {
        if (_QApp.Courses[i].key === key) {
            _QApp.Courses.splice(i, 1);
        }
    }

    _QApp.ReDraw();
};

//-------------------Question Crud---------------

_QApp.SetupCreateSG = function (courseKey) {
    for(var x in _QApp.Courses)
    {
        if(_QApp.Courses[x].key == courseKey)
        {
            document.getElementById("myModalLabel").innerText = "Add a StudyGuide for " + _QApp.Courses[x].name;
            document.getElementById("AddSGButton").setAttribute("onclick", "_QApp.CreateStudyGuide(\'"+ courseKey +"\')")
        }

    }
};

_QApp.CreateStudyGuide = function (courseKey) {
    var name = document.getElementById("studyGuideName");
    var url;

    _QApp.stuGuide = new _QApp.StudyGuide(name.value);
    _QApp.courseKey = courseKey;

    url = _QApp.urlMaker("Course/" + courseKey + "/StudyGuides");
    
    _QApp.Ajax("POST", url, CreateSGCallback, _QApp.stuGuide);
    _QApp.ReDraw();
};

_QApp.CreateSGCallback = function (data) {
    //Need to add the stuGuide under the particular course
    for (var x in _QApp.Courses) {

        if (_QApp.Courses[x].key == _QApp.courseKey) {
            _QApp.stuGuide.key = data.name;
            _QApp.Courses[x].studyGuides.push(_QApp.stuGuide);

        }

    }

    _QApp.stuGuide = null;
    _QApp.courseKey = null;

};

//------------------------Page Transitions-------------

_QApp.Study = function (courseKey) {
    var currentCourse;

    $("#Home").addClass("hidden");
    $("#StudyGuideSelection").removeClass("hidden");

    for (var x in _QApp.Courses) {
        if(_QApp.Courses[x].key == courseKey)
        {
            currentCourse = _QApp.Courses[x];
        }
    }
    $('#SGtitle').text("Study Guides for " + currentCourse.name);

    for(var x in currentCourse.studyGuides)
    {   
        if(!currentCourse.studyGuides[x].questions)
        {
            $("#guidesList").append("<li>" + currentCourse.studyGuides[x].name + ' <button type="button" class="btn btn-default" onclick="_QApp.AddQView(\'' + currentCourse.studyGuides[x].key + '\' , \'' + currentCourse.name + '\')">Add Questions</button>');
        } else {
            for (var name in currentCourse.studyGuides[x].questions)
            {
                currentCourse.studyGuides[x].questions.key = name;
            }
            $("#guidesList").append("<li>" + currentCourse.studyGuides[x].name + '<button type="button" class="btn btn-primary" onclick="_QApp.StudyGuide(\''+ currentCourse.studyGuides[x].key + '\' , \'' + currentCourse.name + '\' , \'' + currentCourse.studyGuides[x].questions.key +'\')">Study</button></li>');
        }
    
    }
    
};

_QApp.goHome = function () {
    $("#Home").removeClass("hidden");
    $("#StudyGuideSelection").addClass("hidden");
    $("#AddQuestions").addClass("hidden");
    $("#StudyGuide").addClass("hidden");

    $("#SGtitle").text(" ");
    $("#guidesList").html(" ");
    $("#StudyArea").html(" ");
};

_QApp.AddQView = function (studyGuideKey, courseName) {
    $("#StudyGuideSelection").addClass("hidden");
    var currentStudyGuide;
    $("#AddQuestions").removeClass("hidden");
    $("#MakeStuG").attr('onclick', '_QApp.makeStudyGuide(\'' + courseName + '\',\'' + studyGuideKey + '\')');

    for (var x in _QApp.Courses)
    {
        if(_QApp.Courses[x].name == courseName)
        {
            for(var y in _QApp.Courses[x].studyGuides)
            {
                if(_QApp.Courses[x].studyGuides[y].key == studyGuideKey)
                {
                    currentStudyGuide = _QApp.Courses[x].studyGuides[y];
                }
            }
        }
    }

    $("#Qtitle").text("Add Questions " + currentStudyGuide.name);


}

_QApp.AddQ = function () {
    var index = (document.getElementsByTagName("textarea").length / 2) + 1;
    event.target.setAttribute("class", "hidden");
    $("#QuestionInput").append(
        '<div class="qandA">' +
        '<textarea class="form-control" id="Q' + index + '" rows="4" placeholder="Question"></textarea><hr/>' +
        '<textarea class="form-control" rows="4" id="A'+ index +'" placeholder="Answer"></textarea><br/>' +
        '<div class="col-md-8 col-md-push-4 hover" onmouseover="_QApp.AddQ()">Hover to Add a new Question</div>' +
        '</div>'
        );
};

_QApp.ReadCourses();

//------------------Study Guide Questions----------------

_QApp.makeStudyGuide = function (courseName, studyGuideKey) {
    var textareas = document.getElementsByTagName("textarea");
    var questions = [];

    for (var i = 0; i < textareas.length; i++)
    {
        var question = { question: textareas[i].value}

        i++;

        question.answer = textareas[i].value;

        if (question.question !== "" || question.answer !== "")
        {
            questions.push(question);
        }
        
    }
    

    for (var x in _QApp.Courses) {
        if (_QApp.Courses[x].name == courseName) {
            _QApp.courseKey = _QApp.Courses[x].key;
            for (var y in _QApp.Courses[x].studyGuides) {
                if (_QApp.Courses[x].studyGuides[y].key == studyGuideKey) {
                    _QApp.currentStudyGuide = _QApp.Courses[x].studyGuides[y];
                }
            }
        }
    }
    _QApp.stuKey = studyGuideKey;

    _QApp.currentStudyGuide.Questions = questions;

    // url -> /Course/courseKey/StudyGuides/studyguideKey/questions
    var url = _QApp.urlMaker("Course/" + _QApp.courseKey + "/StudyGuides/" + studyGuideKey + "/questions");

    _QApp.Ajax("POST", url, _QApp.postSGCB, questions);

}

_QApp.postSGCB = function (data) {
    _QApp.currentStudyGuide.Questions.key = data.name;

    for(var x in _QApp.Courses)
    {
        if(_QApp.Courses[x].key == _QApp.courseKey)
        {
            for (var y in _QApp.Courses[x].studyGuides) {
                if (_QApp.Courses[x].studyGuides[y].key == _QApp.stuKey) {
                     _QApp.Courses[x].studyGuides[y].questions = _QApp.currentStudyGuide.Questions;
                }
            }
        }
    }
    console.log(_QApp.Courses);
    _QApp.currentStudyGuide = null;
    _QApp.stuKey = null;
    _QApp.courseKey = null;
};

_QApp.StudyGuide = function (studyGuideKey, courseName, questionsKey){
    $("#StudyGuide").removeClass("hidden");
    $("#StudyGuideSelection").addClass("hidden");
    var questions = [];
    //find the study guide
    for(var x in _QApp.Courses)
    {
        if(_QApp.Courses[x].name === courseName)
        {
            for(var y in _QApp.Courses[x].studyGuides)
            {
                if(_QApp.Courses[x].studyGuides[y].key === studyGuideKey)
                {
                    for(var z in _QApp.Courses[x].studyGuides[y].questions)
                    {
                        for( var t in _QApp.Courses[x].studyGuides[y].questions[z])
                        {
                            questions.push(_QApp.Courses[x].studyGuides[y].questions[z]);
                            break;
                        }
                    }
                }
            }
        }
    }

    for(var x in questions)
    {
        if(questions[x] instanceof Array)
        {
            for (var i = 0; i < questions[x].length; i++) {
                $("#StudyArea").append('<p class="stuGquestion">' + questions[x][i].question + "</p>");
                $("#StudyArea").append('<p class="stuGanswer">' + questions[x][i].answer + "</p> <hr/>");
            } 
        }
    }


}
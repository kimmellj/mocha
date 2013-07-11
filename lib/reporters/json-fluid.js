
/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;
  
var fs = require('fs');
var request = require('request');

/**
 * Expose `JSON`.
 */

exports = module.exports = JSONFluid;

/**
 * Initialize a new `JSON` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function JSONFluid(runner) {
  var self = this;
  Base.call(this, runner);
  
  var tests = []
    , failures = []
    , passes = []
    , reportTitle = [];
    
  var currentTest;
    
  global.process.on("screenshot_generated", function(data){
    currentTest.screenshot = data.filename;
  });
  
  global.process.on('test_id', function(test_id){
    reportTitle.push(test_id);
  });  
  
  runner.on('test', function(test){
    currentTest = test;
  });

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    currentTest.passed = true;
    passes.push(test);
  });

  runner.on('fail', function(test){
    currentTest.passed = false;
    failures.push(test);
  });
  
  runner.on('end', function(test){
    
    var obj = {
        title: reportTitle.join()
      , stats: self.stats
      , tests: tests.map(clean)
      , failures: failures.map(clean)
      , passes: passes.map(clean)
    };
    
    console.log(JSON.stringify(obj, null, 2));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  var returnObj =  {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  };
  
  if (test.hasOwnProperty("passed")) {
    returnObj.passed = test.passed;
  }  
  
  if (test.hasOwnProperty("screenshot")) {
    returnObj.screenshot = test.screenshot;
  } else {
    returnObj.screenshot = false;
  }
  
  return returnObj;
}

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
    , reportTitle = []
    , screenshots = [];
    
  var currentTest;
    
  global.process.on("screenshot_generated", function(data){
    data.test = currentTest.title;
    screenshots.push(data);
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
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });
  
  runner.on('end', function(test){
    
    var obj = {
        title: reportTitle.join()
      , stats: self.stats
      , tests: tests.map(clean)
      , failures: failures.map(clean)
      , passes: passes.map(clean)
      , screenshots: screenshots
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
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}
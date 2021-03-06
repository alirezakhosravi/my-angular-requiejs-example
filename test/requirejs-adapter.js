(function(testacular, requirejs, require) {

// monkey patch requirejs, to use append timestamps to sources
// to take advantage of testacular's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var normalizePath = function(path) {
    var baseUrl = getRequireJsBaseUrl()
    if(path.indexOf(baseUrl)<0){
        path = baseUrl + path
    }

  var normalized = [];
  var parts = path.split('/');

  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '.') {
      continue;
    }

    if (parts[i] === '..' && normalized.length && normalized[normalized.length - 1] !== '..') {
      normalized.pop();
      continue;
    }

    normalized.push(parts[i]);
  }

  return normalized.join('/');
};

//YEAAAY access undocument, private properties
//WAY TO GO REQUIREJS!
var getRequireJsBaseUrl  = function(){
    return requirejs.s.contexts._.config.baseUrl
}

//accepts the baseUrl attr from requirejs config
//to make the paths relative since requirejs
//chokes when mixing absolute and relative paths :(
var makeFilePathsRelative = function(files, baseUrl) {
    var relative = {}
        ;

    baseUrl = baseUrl || getRequireJsBaseUrl()
    if(baseUrl[baseUrl.length-1]!=='/') {
        baseUrl = baseUrl + '/'
    }
    for(var file in files) {
        var rel = file.replace(baseUrl,'./')

        relative[rel] = files[file]
    }
    return relative
}

var createPatchedLoad = function(files, originalLoadFn) {

  return function (context, moduleName, url) {

    url = normalizePath(url);

    if (files.hasOwnProperty(url)) {
      url = url + '?' + files[url];
    } else {
      console.error('There is no timestamp for ' + url + '!');
    }

    return originalLoadFn.call(this, context, moduleName, url);
  };
};

// make it async
testacular.loaded = function() {};
window.__karma__.makeFilePathsRelative = makeFilePathsRelative

// patch require.js
requirejs.load = createPatchedLoad(testacular.files, requirejs.load);

})(window.__karma__, window.requirejs, window.require);
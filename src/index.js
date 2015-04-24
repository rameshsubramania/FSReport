var findIt = require('findit'),
    path = require('path'),
    fs = require('fs'),
    _ = require('Underscore'),
    Config = require('./../config.json');

function FSReport(){

    function getAllFolders(callback) {
        var finder = findIt(Config.FileSystem.RootFolderPath);
        var sessionFolders = [];
        finder.on('file', function (file, stat) {
            var ext = path.extname(file);
            if (ext.toLowerCase() === Config.FileSystem.FileExtension.toLowerCase()) {
                    sessionFolders.push(path.dirname(file));
            }
        });
        finder.on('end', function(){
            console.log(JSON.stringify(sessionFolders));
            return callback(null, sessionFolders);
        })
    }

    function main(){
        getAllFolders(function (err, folders) {
            _.each(folders, function(folder){
                var mostRecent = getMostRecentFileName(folder);
                var oldest = getOldestFilePath(folder);
                var recentPath = path.join(folder, mostRecent);
                var oldestPath = path.join(folder, oldest);
                if(mostRecent && oldest) {
                    console.log("Most recent file in folder " + folder + " is " + recentPath + " modified time " + fs.statSync(recentPath).ctime);
                    console.log("Oldest file in folder " + folder + " is " + oldestPath + " create time " + fs.statSync(oldestPath).ctime);
                }else{
                    console.log("Folder has no files " + folder);
                }

            })
        })
    }

    function getMostRecentFileName(dir) {
        var files = fs.readdirSync(dir);
        files = filterFiles(files, Config.FileSystem.FileExtension);
        // use underscore for max()
        if(files && files.length > 0) {
            return _.max(files, function (f) {
                var fullpath = path.join(dir, f);
                return fs.statSync(fullpath).mtime;
            });
        }else{
            return null;
        }
    }

    function getOldestFilePath(dir) {
        var files = fs.readdirSync(dir);
        files = filterFiles(files, Config.FileSystem.FileExtension);
        if(files && files.length > 0) {
            return _.min(files, function (f) {
                var fullpath = path.join(dir, f);
                return fs.statSync(fullpath).ctime;
            });
        }else{
            return null;
        }
    }

    function filterFiles(files, ext){
        var filteredFiles = [];
        _.each(files, function(file){
            var fileExt = path.extname(file);
            if(ext == fileExt){
                filteredFiles.push(file);
            }
        })
        return filteredFiles;

    }
    return{
        main: main,
        allFolders: getAllFolders
    }
}



FSReport1 = new FSReport();
FSReport1.main();
module.exports = FSReport;
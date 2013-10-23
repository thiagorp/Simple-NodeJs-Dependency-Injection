'use strict';

module.exports = function() {
    var _ = require('underscore');
    var that;
    var availableModules = {};
    var pendingModules = [];

    var isModuleLoaded = function(name) {
        return availableModules[name] !== undefined;
    };

    var loadModule = function(name, obj) {
        var module;

        if (obj.$dependencies) {
            module = obj.apply(null, resolveDependencies(obj));
        } else {
            module = obj;
        }

        availableModules[name] = module;
        updateMissingDependenciesFor(name);
    };

    var addPending = function(name, obj) {
        pendingModules.push({
            name: name,
            object: obj,
            pending: getPendingDependenciesFor(obj)
        });
    };

    var updateMissingDependenciesFor = function(name) {
        for (var i = 0; i < pendingModules.length; i++) {
            var index = _.indexOf(pendingModules[i].pending, name);
            if (index >= 0) {
                pendingModules[i].pending.splice(index, 1);
                if (pendingModules[i].pending.length === 0) {
                    loadModule(pendingModules[i].name, pendingModules[i].object);
                }
            }
        }
    };

    var allDependenciesAreLoaded = function(obj) {
        var dependencies = obj.$dependencies;

        if (!dependencies) return true;

        for (var i = 0; i < dependencies.length; i++) {
            if (!isModuleLoaded(dependencies[i])) return false;
        }

        return true;
    };

    var resolveDependencies = function(obj) {
        var dependencies = obj.$dependencies;
        var inj = [];

        if (!dependencies) return;

        for (var i = 0; i < dependencies.length; i++) {
            inj.push(getModule(dependencies[i]));
        }

        return inj;
    };

    var getPendingDependenciesFor = function(obj) {
        var dependencies = obj.$dependencies;
        var pending = [];

        for (var i = 0; i < dependencies.length; i++) {
            if (!isModuleLoaded(dependencies[i])) {
                pending.push(dependencies[i]);
            }
        }

        return pending;
    };

    var getModule = function(name) {
        return availableModules[name];
    };

    that = {};

    that.register = function(name, obj) {
        if (allDependenciesAreLoaded(obj)) {
            loadModule(name, obj);
        } else {
            addPending(name, obj);
        }
    };

    that.isModuleLoaded = isModuleLoaded;

    that.get = function(name) {
        if (isModuleLoaded(name)) {
            return getModule(name);
        } else {
            return false;
        }
    };

    return that;
};
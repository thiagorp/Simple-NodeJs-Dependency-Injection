'use strict';

describe('Dependency injection module', function() {
    var mod = require('../lib/di');
    var di;
    var noDependencyModule;
    var noDependencyConsumer;

    beforeEach(function(){
        di = mod();

        noDependencyConsumer = function(noDependency) {
            return {dependency: noDependency};
        };

        noDependencyConsumer.$dependencies = ['noDependency'];

        noDependencyModule = 'noDependencyModule';
    });

    describe('- Module exists', function() {
        it('should be an object', function() {
            di.should.be.an.Object;
        });
    });

    describe('#register()', function() {
        it('should not load the module immediately if all dependencies aren\'t registered yet', function() {
            di.register('noDependencyConsumer', noDependencyConsumer);
            di.isModuleLoaded('noDependencyConsumer').should.not.be.ok;
        });

        it('should load the module if all the dependencies are loaded before', function() {
            di.register('noDependency', noDependencyModule);
            di.register('noDependencyConsumer', noDependencyConsumer);
            di.isModuleLoaded('noDependencyConsumer').should.be.ok;
        });

        it('should immediately have the module available when it has no dependencies', function() {
            di.register('noDependency', noDependencyModule);
            di.isModuleLoaded('noDependency').should.be.ok;
        });

        it('should load the module if all dependencies are loaded after', function() {
            di.register('noDependencyConsumer', noDependencyConsumer);
            di.register('noDependency', noDependencyModule);
            di.isModuleLoaded('noDependencyConsumer').should.be.ok;
        });

        it('should load the module as it is if there\'s no dependencies (compatiblity with native modules)', function() {
            di.register('noDependency', require('net'));
            di.get('noDependency').should.be.equal(require('net'));
        });
    });

    describe('#get()', function() {
        it('should not retrieve a module that hasn\'t been registered', function() {
            var nonExistent = di.get('nonExistent');
            nonExistent.should.not.be.ok;
        });

        it('should not retrieve a module that is not done loading', function() {
            di.register('noDependencyConsumer', noDependencyConsumer);
            var ndc = di.get('noDependencyConsumer');
            ndc.should.not.be.ok;
        });

        it('should retrieve a module that is done loading correctely', function() {
            di.register('noDependency', noDependencyModule);
            di.register('noDependencyConsumer', noDependencyConsumer);
            var dnv = di.get('noDependencyConsumer');
            dnv.should.be.an.Object;
        });
    });

    describe('- Injection', function() {
        it('should have the dependencies injected after the module is loaded', function() {
            di.register('noDependency', noDependencyModule);
            di.register('noDependencyConsumer', noDependencyConsumer);
            var ndc = di.get('noDependencyConsumer');
            ndc.dependency.should.be.equal('noDependencyModule');
        });
    });
});
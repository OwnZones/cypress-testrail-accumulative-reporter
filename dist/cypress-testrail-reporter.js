"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require('chalk');
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var reporterOptions = options.reporterOptions;
        _this.testRail = new testrail_1.TestRail(reporterOptions);
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'suiteId');
        runner.on('start', function () {
            if (reporterOptions.runId) {
                _this.testRail.setRunId(reporterOptions.runId);
            }
            else {
                var name_1 = "" + (reporterOptions.runName || 'Automated test run');
                var description_1 = moment().format('MMM Do YYYY, HH:mm (Z)');
                _this.testRail.getActiveRunId(name_1).then(function (res) {
                    if (!res) {
                        _this.testRail.createRun(name_1, description_1);
                    }
                });
            }
        });
        runner.on('pass', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            // if (caseIds.length > 0) {
            //     const results = caseIds.map(caseId => {
            //         return {
            //             case_id: caseId,
            //             status_id: Status.Passed,
            //             comment: `Execution time: ${test.duration}ms`,
            //         };
            //     });
            //     this.results.push(...results);
            // }
            if (caseIds.length > 0) {
                var result = {
                    case_id: caseIds[0],
                    status_id: testrail_interface_1.Status.Passed,
                    comment: "Execution time: " + test.duration + "ms",
                };
                _this.testRail.publishResult(result);
            }
        });
        runner.on('fail', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            // if (caseIds.length > 0) {
            //     const results = caseIds.map(caseId => {
            //         return {
            //             case_id: caseId,
            //             status_id: Status.Failed,
            //             comment: `${test.err.message.replace(/'/g,'')}`,
            //         };
            //     });
            //     this.results.push(...results);
            // }
            if (caseIds.length > 0) {
                var result = {
                    case_id: caseIds[0],
                    status_id: testrail_interface_1.Status.Failed,
                    comment: "" + test.err.message.replace(/'/g, ''),
                };
                _this.testRail.publishResult(result);
            }
        });
        runner.on('end', function () {
            // if (this.results.length == 0) {
            //     console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            //     console.warn(
            //         '\n',
            //         'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx. Test run will be deleted',
            //         '\n'
            //     );
            //     this.testRail.deleteRun();
            //     return;
            // }
            // this.testRail.publishResults(this.results);
            console.log('\n', chalk.magenta.underline.bold('Testrail upload results: Finished'));
        });
        return _this;
    }
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map
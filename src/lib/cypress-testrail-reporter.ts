import {reporters} from 'mocha';
import * as moment from 'moment';
import {TestRail} from './testrail';
import {titleToCaseIds} from './shared';
import {Status, TestRailResult, manualRevisionScripts} from './testrail.interface';

const process = require('process');
const path = require('path');
const fs = require('fs')
const chalk = require('chalk');

export class CypressTestRailReporter extends reporters.Spec {
    private results: TestRailResult[] = [];
    private testRail: TestRail;

    constructor(runner: any, options: any) {
        super(runner);

        let reporterOptions = options.reporterOptions;
        this.testRail = new TestRail(reporterOptions);
        this.validate(reporterOptions, 'domain');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        this.validate(reporterOptions, 'suiteId');

        runner.on('start', () => {
            if (reporterOptions.runId) {
                this.testRail.setRunId(reporterOptions.runId);
            }
            else {
                const name = `${reporterOptions.runName || 'Automated test run'}`;
                const description = moment().format('MMM Do YYYY, HH:mm (Z)');
                this.testRail.getActiveRunId(name).then(res => {
                    if (!res) {
                        this.testRail.createRun(name, description);
                    }
                });
            }
        });

        runner.on('test', test => {
            console.log('\n', `Starting run for ${chalk.magenta(test.title)}`);
        });

        runner.on('pass', test => {
            const caseIds = titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                const resultPath = path.join(process.cwd(), 'cypress', 'fixtures', 'temporary_files', `${caseIds}.json`),
                    data = fs.existsSync(resultPath) ? JSON.stringify(JSON.parse(fs.readFileSync(resultPath))) : '',
                    comment = `Execution time: ${test.duration}ms\n${data}`,
                    status_id = data ? Status.InProgress : Status.Passed,
                    result = {
                        case_id: caseIds[0],
                        status_id,
                        comment,
                    };
                this.testRail.publishResult(result);
            }
        });

        runner.on('fail', test => {
            const caseIds = titleToCaseIds(test.title);
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
                const result = {
                    case_id: caseIds[0],
                    status_id: Status.Failed,
                    comment: `${test.err.message.replace(/'/g, '')}\n
                    ${__dirname}\n
                    ${process.cwd()}\n
                    ${require.main.filename}`,
                };
                this.testRail.publishResult(result);
            }
        });

        runner.on('end', () => {
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
    }

    private validate(options, name: string) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
        }
    }

    // private done = (failures) => this.testRail.publishResults(this.results, failures);
}

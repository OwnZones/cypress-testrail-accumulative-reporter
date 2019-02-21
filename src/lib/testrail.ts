const axios = require('axios');
const chalk = require('chalk');
import {TestRailOptions, TestRailResult} from './testrail.interface';

export class TestRail {
    private base: String;
    private runId: Number;

    constructor(private options: TestRailOptions) {
        this.base = `https://${options.domain}/index.php?/api/v2`;
    }

    public createRun(name: string, description: string) {
        axios({
            method: 'post',
            url: `${this.base}/add_run/${this.options.projectId}`,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: this.options.suiteId,
                name,
                description,
                include_all: true,
            }),
        })
            .then(response => {
                this.runId = response.data.id;
                // this.runName = name;
            })
            .catch(error => console.error(error));
    }

    public getActiveRunId(activeRunName) {
        return axios({
            method: 'get',
            url: `${this.base}/get_runs/${this.options.projectId}&is_completed=0`,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            }
        })
            .then(response => {
                let runName = response.data[0].name;
                if (activeRunName === runName) {
                    console.log(`Test Run already created today. posting results to Test Run ID: R${response.data[0].id}`)
                    this.runId = response.data[0].id;
                    return true;
                }
                return false;
            })
            .catch(error => console.error(error));
    }

    public getRunId() {
        return this.runId;
    }

    public setRunId(runId) {
        this.runId = runId;
    }

    public deleteRun() {
        axios({
            method: 'post',
            url: `${this.base}/delete_run/${this.runId}`,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(error => console.error(error));
    }

    public publishResults(results: TestRailResult[]) {
        axios({
            method: 'post',
            url: `${this.base}/add_results_for_cases/${this.runId}`,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({results}),
        })
            .then(response => {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.log(
                    '\n',
                    ` - Results are published to ${chalk.magenta(
                        `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
                    )}`,
                    '\n'
                );
            })
            .catch(error => console.error(error))
            // .then(() => {
            //     process.exit(failures);
            // });
    }

    public publishResult(result: TestRailResult) {
        axios({
            method: 'post',
            url: `${this.base}/add_result_for_case/${this.runId}/${result.case_id}`,
            headers: {'Content-Type': 'application/json'},
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({status_id: result.status_id, comment: result.comment}),
        })
            .then(response => {
                console.log(
                    '\n',
                    ` - Results are published for ${chalk.magenta(`${result.case_id}`)}`,
                    '\n');
            })
            .catch(error => console.error(error));
    }
}

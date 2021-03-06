import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as vs from "vscode";
import { fsPath } from "../../src/utils";
import { sb, waitForResult } from "../helpers";
import sinon = require("sinon");

describe.skip("flutter web", () => {
	it("created a templated project", async () => {
		const executeCommand = sb.stub(vs.commands, "executeCommand").callThrough();
		const getPackagesCommand = executeCommand.withArgs("dart.getPackages", sinon.match.any).resolves();

		const sampleProjectFolder = fsPath(vs.workspace.workspaceFolders[0].uri);
		const expectedString = "import 'package:flutter_web";
		const mainFile = path.join(sampleProjectFolder, "web", "main.dart");

		// Creating the sample may be a little slow, so allow up to 60 seconds for it.
		await waitForResult(() => fs.existsSync(mainFile), "web/main.dart did not exist", 60000);

		// Wait for up to 10 seconds for the content to match, as the file may be updated after creation.
		await waitForResult(() => {
			const contents = fs.readFileSync(mainFile);
			return contents.indexOf(expectedString) !== -1;
		}, undefined, 10000, false); // Don't throw on failure, as we have a better assert below that can include the contents.

		const contents = fs.readFileSync(mainFile);
		if (contents.indexOf(expectedString) === -1)
			assert.fail(`Did not find "${expectedString}'" in the templated file:\n\n${contents}`);

		// Ensure we fetched packages too.
		assert.ok(getPackagesCommand.called);
	});
});

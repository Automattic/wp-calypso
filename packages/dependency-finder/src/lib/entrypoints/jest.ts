/**
 * External dependencies
 */
import path from 'path';
import jestConfig from 'jest-config';
import globby from 'globby';

export const findJestEntrypoints = async ( {
	jestConfigPath,
}: {
	jestConfigPath: string;
} ): Promise< string[] > => {
	const config = await jestConfig.readConfig(
		{
			config: jestConfigPath,
			_: [ '' ],
			$0: '',
		},
		path.dirname( jestConfigPath )
	);
	const tests = await globby( config.projectConfig.testMatch );
	return tests;
};

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.resolve() ),
} ) );

import { loadScript } from '@automattic/load-script';
import { loadSurvicateScript } from '../load-script';

describe( 'loadSurvicateScript', () => {
	test( 'should call loadScript with the correct Survicate URL', async () => {
		await loadSurvicateScript( 'test-workspace-id' );

		expect( loadScript ).toHaveBeenCalledWith(
			'https://survey.survicate.com/workspaces/test-workspace-id/web_surveys.js'
		);
	} );

	test( 'should propagate errors from loadScript', async () => {
		( loadScript as jest.Mock ).mockRejectedValueOnce( new Error( 'load failed' ) );

		await expect( loadSurvicateScript( 'test-id' ) ).rejects.toThrow( 'load failed' );
	} );
} );

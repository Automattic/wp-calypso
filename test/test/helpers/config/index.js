/**
 * Internal dependencies
 */
import config from 'config';

export const setFeatureFlag = ( feature, val ) => {
	const c = config;
	let spy;

	beforeAll( () => {
		spy = jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation( ( feat ) => ( feat === feature ? val : c.isEnabled( feat ))  );
	} );

	afterAll( () => {
		spy.mockReset();
		spy.mockRestore();
	} );
};

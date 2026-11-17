import config from '@automattic/calypso-config';

export const setFeatureFlag = ( feature, val ) => {
	let previous;

	beforeAll( () => {
		previous = config.isEnabled( feature );
		( val ? config.enable : config.disable )( feature );
	} );

	afterAll( () => {
		( previous ? config.enable : config.disable )( feature );
	} );
};

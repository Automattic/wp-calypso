import { canUseVideoPress } from '../can-use-videopress';

const withVideoPressModule = {
	jetpack: true,
	options: { active_modules: [ 'videopress' ] },
};

describe( 'canUseVideoPress', () => {
	test( 'allows Simple sites (the server decides at transcode time)', () => {
		expect( canUseVideoPress( { jetpack: false, options: {} } ) ).toBe( true );
	} );

	test( 'allows Jetpack sites with the VideoPress module active', () => {
		expect( canUseVideoPress( withVideoPressModule ) ).toBe( true );
	} );

	test( 'refuses Jetpack sites without the VideoPress module', () => {
		expect( canUseVideoPress( { jetpack: true, options: { active_modules: [] } } ) ).toBe( false );
	} );

	test( 'refuses Atomic sites whose plan does not include VideoPress, even with the module on', () => {
		const site = {
			...withVideoPressModule,
			is_wpcom_atomic: true,
			plan: { features: { active: [ 'upload-video-files' ] } },
		};

		expect( canUseVideoPress( site ) ).toBe( false );
	} );

	test( 'reads the Atomic flag from the site options too', () => {
		const site = {
			jetpack: true,
			options: { active_modules: [ 'videopress' ], is_wpcom_atomic: true },
			plan: { features: { active: [ 'upload-video-files' ] } },
		};

		expect( canUseVideoPress( site ) ).toBe( false );
	} );

	test( 'allows Atomic sites whose plan includes VideoPress', () => {
		const site = {
			...withVideoPressModule,
			is_wpcom_atomic: true,
			plan: { features: { active: [ 'upload-video-files', 'videopress' ] } },
		};

		expect( canUseVideoPress( site ) ).toBe( true );
	} );

	test( 'keeps the module check for Atomic sites whose plan features are not loaded', () => {
		expect( canUseVideoPress( { ...withVideoPressModule, is_wpcom_atomic: true } ) ).toBe( true );
	} );
} );

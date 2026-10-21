import { createBootProgressCallbacks } from '../lib/boot-progress';

const installWooCommerce = {
	step: 'installPlugin',
	pluginData: { resource: 'wordpress.org/plugins', slug: 'woocommerce' },
};
const installOther = {
	step: 'installPlugin',
	pluginData: { resource: 'wordpress.org/plugins', slug: 'wordpress-importer' },
};
const login = { step: 'login', username: 'admin' };
const setSiteOptions = { step: 'setSiteOptions', options: {} };

describe( 'createBootProgressCallbacks', () => {
	it.each( [
		[
			'WooCommerce pending until its install step completes',
			[ login, installWooCommerce, setSiteOptions, installOther ],
			[
				{ stage: 'woocommerce', value: 50 },
				{ stage: 'woocommerce', value: 63 },
				{ stage: 'store', value: 75 },
				{ stage: 'store', value: 88 },
				{ stage: 'store', value: 100 },
			],
		],
		[
			'store setup only when the blueprint does not install WooCommerce',
			[ login, installOther ],
			[
				{ stage: 'store', value: 50 },
				{ stage: 'store', value: 75 },
				{ stage: 'store', value: 100 },
			],
		],
		[ 'the steps start when the blueprint has none', [], [ { stage: 'store', value: 50 } ] ],
	] )( 'reports %s', ( _label, steps, expected ) => {
		const onProgress = jest.fn();
		const { onBlueprintValidated, onBlueprintStepCompleted } =
			createBootProgressCallbacks( onProgress );

		onBlueprintValidated( { steps } );
		steps.forEach( ( step ) => onBlueprintStepCompleted( undefined, step ) );

		expect( onProgress.mock.calls.map( ( [ progress ] ) => progress ) ).toEqual( expected );
	} );
} );

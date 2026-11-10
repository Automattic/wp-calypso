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
				{ stage: 'woocommerce' },
				{ stage: 'woocommerce' },
				{ stage: 'store', value: 70 },
				{ stage: 'store', value: 80 },
				{ stage: 'store', value: 90 },
			],
		],
		[
			'store setup only when the blueprint does not install WooCommerce',
			[ login, installOther ],
			[
				{ stage: 'store', value: 50 },
				{ stage: 'store', value: 70 },
				{ stage: 'store', value: 90 },
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

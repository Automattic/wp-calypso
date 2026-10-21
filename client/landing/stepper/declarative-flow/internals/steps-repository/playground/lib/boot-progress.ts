/**
 * What a new Playground is busy with while it boots: WordPress itself, the
 * WooCommerce install, then the remaining store setup steps.
 */
export type PlaygroundBootStage = 'wordpress' | 'woocommerce' | 'store';

export interface PlaygroundBootProgress {
	stage: PlaygroundBootStage;
	// Percent complete; undefined while WordPress boots, as the client reports no progress for it.
	value?: number;
}

export const INITIAL_BOOT_PROGRESS: PlaygroundBootProgress = { stage: 'wordpress' };

// Blueprint steps share the second half of the bar; the first half is the WordPress boot.
const STEPS_START = 50;

const isWooCommerceInstallStep = ( step: unknown ) => {
	if ( ! step || typeof step !== 'object' ) {
		return false;
	}

	const { step: name, pluginData } = step as { step?: unknown; pluginData?: { slug?: unknown } };
	return name === 'installPlugin' && pluginData?.slug === 'woocommerce';
};

/**
 * Builds the `startPlaygroundWeb()` callbacks that report boot progress.
 * `onBlueprintValidated` receives the compiled declaration, so its steps match
 * the `onBlueprintStepCompleted` calls one to one.
 */
export function createBootProgressCallbacks(
	onProgress: ( progress: PlaygroundBootProgress ) => void
) {
	let total = 0;
	let completed = 0;
	let isWooCommercePending = false;

	const report = () =>
		onProgress( {
			stage: isWooCommercePending ? 'woocommerce' : 'store',
			value:
				STEPS_START + ( total ? Math.round( ( ( 100 - STEPS_START ) * completed ) / total ) : 0 ),
		} );

	return {
		onBlueprintValidated: ( declaration: { steps?: unknown[] } ) => {
			const steps = declaration.steps ?? [];
			total = steps.length;
			isWooCommercePending = steps.some( isWooCommerceInstallStep );
			report();
		},
		onBlueprintStepCompleted: ( _output: unknown, step: unknown ) => {
			completed = Math.min( completed + 1, total );
			if ( isWooCommerceInstallStep( step ) ) {
				isWooCommercePending = false;
			}
			report();
		},
	};
}

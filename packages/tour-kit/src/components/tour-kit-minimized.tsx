/**
 * Internal Dependencies
 */
import type { Config } from '../types';

interface Props {
	config: Config;
	currentStepIndex: number;
	onMaximize: () => void;
	onDismiss: ( target: string ) => () => void;
}

const TourKitMinimized: React.FunctionComponent< Props > = ( {
	config,
	currentStepIndex,
	onMaximize,
	onDismiss,
} ) => {
	return config.renderers.tourMinimized( {
		steps: config.steps,
		currentStepIndex,
		onMaximize,
		onDismiss,
	} );
};

export default TourKitMinimized;

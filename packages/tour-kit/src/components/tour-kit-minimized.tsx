/**
 * Internal Dependencies
 */
import { MinimizedTourRendererProps } from '../types';
import type { Config } from '../types';

interface Props extends MinimizedTourRendererProps {
	config: Config;
}

const TourKitMinimized: React.FunctionComponent< Props > = ( {
	config,
	steps,
	currentStepIndex,
	onMaximize,
	onDismiss,
} ) => {
	return config.renderers.tourMinimized( {
		steps,
		currentStepIndex,
		onMaximize,
		onDismiss,
	} );
};

export default TourKitMinimized;

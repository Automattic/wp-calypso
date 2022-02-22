import { Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import minimize from '../icons/minimize';
import type { TourStepRendererProps } from '../../../types';

interface Props {
	onMinimize: TourStepRendererProps[ 'onMinimize' ];
	onDismiss: TourStepRendererProps[ 'onDismiss' ];
}

const WpcomTourKitStepCardOverlayControls: React.FunctionComponent< Props > = ( {
	onMinimize,
	onDismiss,
} ) => {
	return (
		<div className="wpcom-tour-kit-step-card-overlay-controls">
			<Flex>
				<Button
					label={ __( 'Minimize Tour' ) }
					isPrimary
					className="wpcom-tour-kit-step-card-overlay-controls__minimize-icon"
					icon={ minimize }
					iconSize={ 24 }
					onClick={ onMinimize }
				></Button>
				<Button
					label={ __( 'Close Tour' ) }
					isPrimary
					icon={ close }
					iconSize={ 24 }
					onClick={ onDismiss( 'close-btn' ) }
				></Button>
			</Flex>
		</div>
	);
};

export default WpcomTourKitStepCardOverlayControls;

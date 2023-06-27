import { Button, Flex } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
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
	const { __ } = useI18n();

	return (
		<div className="wpcom-tour-kit-step-card-overlay-controls">
			<Flex>
				<Button
					label={ __( 'Minimize Tour', __i18n_text_domain__ ) }
					variant="primary"
					className="wpcom-tour-kit-step-card-overlay-controls__minimize-icon"
					icon={ minimize }
					iconSize={ 24 }
					onClick={ onMinimize }
				></Button>
				<Button
					label={ __( 'Close Tour', __i18n_text_domain__ ) }
					variant="primary"
					icon={ close }
					iconSize={ 24 }
					onClick={ onDismiss( 'close-btn' ) }
				></Button>
			</Flex>
		</div>
	);
};

export default WpcomTourKitStepCardOverlayControls;

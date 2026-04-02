import { Button } from '@wordpress/components';
import './style.scss';
import { __ } from '@wordpress/i18n';
import { square as zoomOutIcon } from '@wordpress/icons';
import { toggleZoom, isZoomedOut } from '../../utils/canvas-zoom';

export default function ZoomToggleButton() {
	return (
		<Button
			className="agents-manager-zoom-toggle-button"
			icon={ zoomOutIcon }
			label={ __( 'Toggle zoom', '__i18n_text_domain__' ) }
			onClick={ toggleZoom }
			isPressed={ isZoomedOut() }
			size="small"
		/>
	);
}

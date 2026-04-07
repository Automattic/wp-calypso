import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { square as zoomIcon } from '@wordpress/icons';
import { toggleZoom } from '../../utils/canvas-zoom';
import { unlock } from '../../utils/unlock-private-apis';
import './style.scss';

export default function ZoomActionButton() {
	const isZoomOut = useSelect( ( select ) => unlock( select( blockEditorStore ) ).isZoomOut(), [] );

	return (
		<Button
			className="agents-manager-zoom-action-button"
			icon={ zoomIcon }
			label={
				isZoomOut
					? __( 'Zoom in', '__i18n_text_domain__' )
					: __( 'Zoom out', '__i18n_text_domain__' )
			}
			onClick={ toggleZoom }
			isPressed={ isZoomOut }
			size="compact"
		/>
	);
}

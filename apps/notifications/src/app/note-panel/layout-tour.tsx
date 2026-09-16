import { Button, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';

const GEAR_SELECTOR = '.wpnc-app__settings-toggle';

// The gear renders through `Menu.TriggerButton`'s `render` prop, which gives us no ref to
// hold, so the anchor is read from the DOM once it mounts. Mirrors the dashboard's
// guided-tour step, which anchors the same way and gives up after a few seconds.
const useGearAnchor = ( timeout = 3000 ): HTMLElement | null => {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );

	useEffect( () => {
		const deadline = Date.now() + timeout;
		let frame = 0;

		const find = () => {
			const element = document.querySelector< HTMLElement >( GEAR_SELECTOR );

			if ( element ) {
				setAnchor( element );
			} else if ( Date.now() < deadline ) {
				frame = requestAnimationFrame( find );
			}
		};

		find();

		return () => cancelAnimationFrame( frame );
	}, [ timeout ] );

	return anchor;
};

export default function LayoutTour( { onDismiss }: { onDismiss: () => void } ) {
	const anchor = useGearAnchor();

	if ( ! anchor ) {
		return null;
	}

	return (
		<Popover
			anchor={ anchor }
			placement="bottom-end"
			offset={ 8 }
			focusOnMount={ false }
			// Render in place, for the same reason the menus do: portalled to the body the
			// coordinates are document-relative and the popover chases the fixed panel.
			inline
			className="wpnc-app__layout-tour"
		>
			<div className="wpnc-app__layout-tour-body">
				<h3 className="wpnc-app__layout-tour-title">
					{
						/* translators: (New) marks a setting that has only just become available. */
						__( 'Switch layouts (New)' )
					}
				</h3>
				<p className="wpnc-app__layout-tour-text">
					{ __( 'Choose how much detail each row shows.' ) }
				</p>
				<Button variant="primary" size="compact" onClick={ onDismiss }>
					{ __( 'Got it' ) }
				</Button>
			</div>
		</Popover>
	);
}

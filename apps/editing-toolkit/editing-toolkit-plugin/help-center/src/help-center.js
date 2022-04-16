import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useRef, useLayoutEffect } from 'react';
import './help-center.scss';

function HelpCenterComponent() {
	const isDesktop = useRef( false );
	const { show } = useSelect( ( select ) => {
		return {
			show: select( 'automattic/help-center' ).isHelpCenterShown(),
		};
	} );
	const setShowHelpCenter = useDispatch( 'automattic/help-center' )?.setShowHelpCenter;

	useLayoutEffect( () => {
		isDesktop.current = ! window.matchMedia( '(max-width: 480px)' ).matches;

		window.matchMedia( '(max-width: 480px)' ).addEventListener( 'change', ( event ) => {
			isDesktop.current = event.matches ? false : true;
		} );

		return () => {
			window.matchMedia( '(max-width: 480px)' ).removeEventListener( 'change' );
		};
	}, [] );

	return (
		<>
			{ isDesktop.current && (
				<PinnedItems scope="core/edit-post">
					<span className="etk-help-center">
						<Button
							className={ cx( 'entry-point-button', { 'is-active': show } ) }
							onClick={ () => setShowHelpCenter( ! show ) }
							icon={ <HelpIcon newItems active={ show } /> }
						></Button>
					</span>
				</PinnedItems>
			) }
			{ show && (
				<HelpCenter
					content={ <h1>Help center</h1> }
					handleClose={ () => setShowHelpCenter( false ) }
				/>
			) }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => <HelpCenterComponent />,
} );

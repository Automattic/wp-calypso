import HelpCenter from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useRef, useLayoutEffect } from 'react';
import './help-center.scss';

const HelpIcon = ( { newItems, active } ) => (
	<svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle
			cx="12"
			cy="12.5"
			r="8"
			stroke={ active ? 'white' : '#1e1e1e' }
			fill={ active ? '#1e1e1e' : 'white' }
			stroke-width="1.5"
		/>
		<path
			d="M9.75 10.75C9.75 9.50736 10.7574 8.5 12 8.5C13.2426 8.5 14.25 9.50736 14.25 10.75C14.25 11.9083 13.3748 12.8621 12.2496 12.9863C12.1124 13.0015 12 13.1119 12 13.25V14.5"
			stroke={ active ? 'white' : '#1e1e1e' }
			stroke-width="1.5"
			fill="none"
		/>
		<path d="M12 15.5V17" stroke={ active ? 'white' : '#1e1e1e' } stroke-width="1.5" />
		{ newItems && (
			<circle
				cx="20"
				cy="8"
				r="5"
				stroke={ active ? '#1e1e1e' : 'white' }
				fill="#0675C4"
				stroke-width="2"
			/>
		) }
	</svg>
);

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

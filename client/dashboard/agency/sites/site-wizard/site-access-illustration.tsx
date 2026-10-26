import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import useGraphicHover from './use-graphic-hover';
import './site-access-illustration.scss';

function getSiteActions() {
	return [
		__( 'WP Admin' ),
		__( 'Visit site' ),
		__( 'Set up site' ),
		__( 'Change domain' ),
		__( 'Settings' ),
		__( 'View activity' ),
		__( 'Copy this site' ),
		__( 'Remove site' ),
	];
}

const MENU_ITEM_HEIGHT = 36;
const MENU_STEP_MS = 900;

export default function SiteActionsMenu() {
	const actions = getSiteActions();
	const menuRef = useRef< HTMLDivElement >( null );
	const hovered = useGraphicHover( menuRef );
	const [ active, setActive ] = useState( 0 );
	useEffect( () => {
		if ( ! hovered ) {
			setActive( 0 );
			return;
		}
		setActive( 1 );
		const interval = window.setInterval(
			() => setActive( ( index ) => ( index + 1 ) % actions.length ),
			MENU_STEP_MS
		);
		return () => window.clearInterval( interval );
	}, [ hovered, actions.length ] );
	return (
		<div className="agency-access-menu" ref={ menuRef }>
			<ul className="agency-access-menu__list">
				<li
					className="agency-access-menu__highlight"
					aria-hidden="true"
					style={ { transform: `translateY( ${ active * MENU_ITEM_HEIGHT }px )` } }
				/>
				{ actions.map( ( action, index ) => (
					<li key={ action } data-active={ index === active || undefined }>
						{ action }
					</li>
				) ) }
			</ul>
		</div>
	);
}

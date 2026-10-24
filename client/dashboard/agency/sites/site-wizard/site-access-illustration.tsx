import { __ } from '@wordpress/i18n';
import { external, Icon, moreVertical } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import useSectionHover from './use-section-hover';
import type { SiteAccessIllustrationVariant } from './site-access-variants';
import './site-access-illustration.scss';

function getSiteActions() {
	return [
		{ label: __( 'WP Admin' ), external: true },
		{ label: __( 'Visit site' ), external: true },
		{ label: __( 'Set up site' ) },
		{ label: __( 'Change domain' ), external: true },
		{ label: __( 'Settings' ) },
		{ label: __( 'View activity' ) },
		{ label: __( 'Copy this site' ), external: true },
		{ label: __( 'Remove site' ) },
	];
}

function SiteActionsMenu() {
	const actions = getSiteActions();
	return (
		<div className="agency-sites-story__menu-preview">
			<span className="agency-sites-story__menu-trigger">
				<Icon icon={ moreVertical } size={ 24 } />
			</span>
			<ul className="agency-sites-story__site-actions">
				{ actions.map( ( action ) => (
					<li key={ action.label }>
						<span>{ action.label }</span>
						{ action.external && <Icon icon={ external } size={ 14 } /> }
					</li>
				) ) }
			</ul>
		</div>
	);
}

const MENU_ITEM_HEIGHT = 36;
const MENU_STEP_MS = 900;

function CleanMenu() {
	const actions = getSiteActions();
	const menuRef = useRef< HTMLDivElement >( null );
	const hovered = useSectionHover( menuRef );
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
					<li key={ action.label } data-active={ index === active || undefined }>
						{ action.label }
					</li>
				) ) }
			</ul>
		</div>
	);
}

export default function SiteAccessIllustration( {
	variant,
}: {
	variant: SiteAccessIllustrationVariant;
} ) {
	switch ( variant ) {
		case 'menu-clean':
			return <CleanMenu />;
		default:
			return <SiteActionsMenu />;
	}
}

/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useDetectWindowBoundary from 'calypso/my-sites/plans-v2/use-detect-window-boundary';

/**
 * Style dependencies
 */
import './style.scss';

const JETPACK_COM_BASE_URL = 'https://jetpack.com';
const getMenuItems = ( translate: ReturnType< typeof useTranslate > ) => [
	{
		title: translate( 'Product Tour' ),
		path: 'features',
	},
	{
		title: translate( 'Pricing' ),
		path: 'pricing',
	},
	{
		title: translate( 'Support' ),
		path: 'support',
	},
	{
		title: translate( 'Blog' ),
		path: 'blog',
	},
];

const JetpackComMasterbar = () => {
	const translate = useTranslate();
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const barRef = useRef< HTMLDivElement | null >( null );
	const hasCrossed = useDetectWindowBoundary( barRef );

	const toggleMenu = () => {
		setIsMenuOpen( ( currentState ) => ! currentState );
	};

	return (
		<div ref={ barRef } className={ classNames( 'jpcom-masterbar', { sticky: hasCrossed } ) }>
			<div className="jpcom-masterbar__inner">
				<ExternalLink
					className="jpcom-masterbar__logo"
					href={ JETPACK_COM_BASE_URL }
					onClick={ () => {
						recordTracksEvent( 'calypso_jetpack_nav_logo_click' );
					} }
				>
					<JetpackLogo className="jpcom-masterbar__jetpack-logo" full size={ 49 } />
				</ExternalLink>

				<Button
					className={ classNames( [ 'jpcom-masterbar__navbutton', 'mobilenav' ], {
						'is-active': isMenuOpen,
					} ) }
					aria-label={ translate( 'Menu' ) }
					aria-controls="navigation"
					onClick={ toggleMenu }
				>
					<span className="jpcom-masterbar__navbox">
						<span className="jpcom-masterbar__navinner"></span>
					</span>
					<span className="jpcom-masterbar__navlabel">
						{ isMenuOpen ? null : translate( 'Menu' ) }
					</span>
				</Button>

				<ul className={ classNames( 'jpcom-masterbar__nav', { 'is-open': isMenuOpen } ) }>
					{ getMenuItems( translate ).map( ( { title, path }, index ) => (
						<li className="jpcom-masterbar__nav-item" key={ index }>
							<a
								className={ path === 'pricing' ? 'current' : '' }
								href={ `${ JETPACK_COM_BASE_URL }/${ path }` }
								onClick={ () => {
									recordTracksEvent( 'calypso_jetpack_nav_item_click', { nav_item: path } );
								} }
							>
								{ title }
							</a>
						</li>
					) ) }
				</ul>
			</div>
		</div>
	);
};

export default JetpackComMasterbar;

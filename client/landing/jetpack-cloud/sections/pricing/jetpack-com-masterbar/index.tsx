/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import JetpackLogo from 'components/jetpack-logo';
import useDetectWindowBoundary from 'my-sites/plans-v2/use-detect-window-boundary';

/**
 * Style dependencies
 */
import './style.scss';

const JETPACK_COM_BASE_URL = 'https://jetpack.com';
const MENU_ITEMS = [
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
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const barRef = useRef< HTMLDivElement | null >( null );
	const hasCrossed = useDetectWindowBoundary( barRef );

	const toggleMenu = () => {
		setIsMenuOpen( ( currentState ) => ! currentState );
	};

	return (
		<div ref={ barRef } className={ classNames( 'jetpack-com-masterbar', { sticky: hasCrossed } ) }>
			<div className="jetpack-com-masterbar__inner">
				<a
					className="jetpack-com-masterbar__logo"
					href={ JETPACK_COM_BASE_URL }
					target="_blank"
					rel="noopener noreferrer"
				>
					<JetpackLogo className="jetpack-com-masterbar__jetpack-logo" full size={ 48 } />
				</a>

				<Button
					className={ classNames( [ 'jetpack-com-masterbar__navbutton', 'mobilenav' ], {
						'is-active': isMenuOpen,
					} ) }
					aria-label={ translate( 'Menu' ) }
					aria-controls="navigation"
					onClick={ toggleMenu }
				>
					<span className="jetpack-com-masterbar__navbox">
						<span className="jetpack-com-masterbar__navinner"></span>
					</span>
					<span className="jetpack-com-masterbar__navlabel">
						{ isMenuOpen ? null : translate( 'Menu' ) }
					</span>
				</Button>

				<ul className={ classNames( 'jetpack-com-masterbar__nav', { 'is-open': isMenuOpen } ) }>
					{ MENU_ITEMS.map( ( { title, path }, index ) => (
						<li className="jetpack-com-masterbar__nav-item" key={ index }>
							<a
								className={ path === 'pricing' ? 'current' : '' }
								href={ `${ JETPACK_COM_BASE_URL }/${ path }` }
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

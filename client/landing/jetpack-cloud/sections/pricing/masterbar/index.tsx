/**
 * External dependencies
 */
import React, { useRef } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import useDetectWindowBoundary from 'my-sites/plans-v2/use-detect-window-boundary';

/**
 * Style dependencies
 */
import './style.scss';

const JETPACK_COM_BASE_URL = 'https://jetpack.com';
const NAVIGATION_ITEMS = [
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

const Masterbar = () => {
	const barRef = useRef< HTMLDivElement | null >( null );
	const hasCrossed = useDetectWindowBoundary( barRef );

	return (
		<div ref={ barRef } className={ classNames( 'pricing-masterbar', { sticky: hasCrossed } ) }>
			<a
				className="pricing-masterbar__logo"
				href={ JETPACK_COM_BASE_URL }
				target="_blank"
				rel="noopener noreferrer"
			>
				<JetpackLogo full size={ 48 } />
			</a>

			<ul className="pricing-masterbar__nav">
				{ NAVIGATION_ITEMS.map( ( { title, path } ) => (
					<li className="pricing-masterbar__nav-item" key={ title }>
						<a
							className={ path === 'pricing' ? 'current' : null }
							href={ `${ JETPACK_COM_BASE_URL }/${ path }` }
						>
							{ title }
						</a>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default Masterbar;

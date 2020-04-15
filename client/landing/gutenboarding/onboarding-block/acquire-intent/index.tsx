/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useSelect } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import Link from '../../components/link';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import Arrow from './arrow';

/**
 * Style dependencies
 */
import './style.scss';

const AcquireIntent: FunctionComponent = () => {
	const { __ } = useI18n();
	const { siteVertical, siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const makePath = usePath();

	const [ isSiteTitleActive, setSiteTitleActive ] = React.useState( false );
	const isMobile = useViewportMatch( 'small', '<' );

	const displaySiteTitle = isSiteTitleActive || ! isMobile;
	const displayVerticalSelect = ! isSiteTitleActive || ! isMobile;

	return (
		<div className="gutenboarding-page acquire-intent">
			<div className="acquire-intent__questions">
				{ displayVerticalSelect && <VerticalSelect onNext={ () => setSiteTitleActive( true ) } /> }
				{ /* We are rendering everything to keep the content vertically centered on desktop while preventing jumping */ }
				{ isSiteTitleActive && (
					<Arrow
						className="acquire-intent__mobile-back-arrow"
						onClick={ () => setSiteTitleActive( false ) }
					/>
				) }
				<SiteTitle isVisible={ !! ( siteVertical || siteTitle ) && displaySiteTitle } />
				<div
					className={ classnames( 'acquire-intent__footer', {
						'acquire-intent__footer--hidden': ! siteVertical || ! displaySiteTitle,
					} ) }
				>
					<Link
						className="acquire-intent__question-skip"
						isPrimary
						to={ siteVertical && makePath( Step.DesignSelection ) }
					>
						{ /* @TODO: add transitions and correct action */ }
						{ siteTitle ? __( 'Choose a design' ) : __( 'Donʼt know yet' ) }
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AcquireIntent;

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

	const [ isSiteTitleActive, setIsSiteTitleActive ] = React.useState( false );
	const isMobile = useViewportMatch( 'small', '<' );

	const displaySiteTitle = isSiteTitleActive || ! isMobile;
	const displayVerticalSelect = ! isSiteTitleActive || ! isMobile;

	return (
		<div
			className={ classnames( 'gutenboarding-page acquire-intent', {
				'acquire-intent--mobile-vertical-step': ! isSiteTitleActive && isMobile,
			} ) }
		>
			{ displayVerticalSelect && <VerticalSelect onNext={ () => setIsSiteTitleActive( true ) } /> }
			{ /* We are rendering everything to keep the content vertically centered on desktop while preventing jumping */ }
			{ displaySiteTitle && (
				<>
					{ isMobile && (
						<Arrow
							className="acquire-intent__mobile-back-arrow"
							onClick={ () => setIsSiteTitleActive( false ) }
						/>
					) }
					<SiteTitle isVisible={ !! ( siteVertical || siteTitle ) } />
					<div
						className={ classnames( 'acquire-intent__footer', {
							'acquire-intent__footer--hidden': ! siteVertical,
						} ) }
					>
						<Link
							className="acquire-intent__question-skip"
							isPrimary
							to={ siteVertical && makePath( Step.DesignSelection ) }
						>
							{ siteTitle ? __( 'Choose a design' ) : __( 'Donʼt know yet' ) }
						</Link>
					</div>
				</>
			) }
		</div>
	);
};

export default AcquireIntent;

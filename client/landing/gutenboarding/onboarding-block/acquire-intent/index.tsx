/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useSelect, useDispatch } from '@wordpress/data';
import { NextButton, SkipButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import SiteTitle from './site-title';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { prefetchDesignThumbs } from '../../available-designs';
import { recordSiteTitleSkip } from '../../lib/analytics';

/**
 * Style dependencies
 */
import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { getSelectedSiteTitle } = useSelect( ( select ) => select( STORE_KEY ) );
	const { setSiteTitle, setDomainSearch } = useDispatch( STORE_KEY );

	const { goNext } = useStepNavigation();

	useTrackStep( 'IntentGathering', () => ( {
		has_selected_site_title: !! getSelectedSiteTitle(),
	} ) );

	const hasSiteTitle = getSelectedSiteTitle()?.trim().length > 1; // for domain results, we need at least 2 characters

	React.useEffect( prefetchDesignThumbs, [] );

	const handleContinue = () => {
		hasSiteTitle && setDomainSearch( getSelectedSiteTitle() );
		goNext();
	};

	const handleSkip = () => {
		setSiteTitle( '' ); // reset site title if there is no valid entry
		recordSiteTitleSkip();
		handleContinue();
	};

	return (
		<div
			className={ classnames( 'gutenboarding-page acquire-intent', {
				'acquire-intent--with-skip': ! hasSiteTitle,
			} ) }
		>
			<SiteTitle onSubmit={ handleContinue } />
			<div className="acquire-intent__footer">
				{ hasSiteTitle ? (
					<NextButton onClick={ handleContinue } />
				) : (
					<SkipButton onClick={ handleSkip } />
				) }
			</div>
		</div>
	);
};

export default AcquireIntent;

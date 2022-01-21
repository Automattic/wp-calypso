import { isGoodDefaultDomainQuery } from '@automattic/domain-picker';
import { ActionButtons, BackButton, NextButton, SkipButton } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import useDetectMatchingAnchorSite from '../../hooks/use-detect-matching-anchor-site';
import useFseBetaOptInStep from '../../hooks/use-fse-beta-opt-in-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { recordSiteTitleSkip } from '../../lib/analytics';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY } from '../../stores/onboard';
import SiteTitle from './site-title';

import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { getSelectedSiteTitle, hasSiteTitle } = useSelect( ( select ) => select( STORE_KEY ) );

	const siteTitleRef = React.useRef< HTMLInputElement >();

	const { setDomainSearch, setSiteTitle } = useDispatch( STORE_KEY );

	const { goBack, goNext } = useStepNavigation();

	useTrackStep( 'IntentGathering', () => ( {
		has_selected_site_title: hasSiteTitle(),
	} ) );

	// Allow Anchor Gutenboarding to check the backend for matching sites and redirect if found.
	const isAnchorFm = useIsAnchorFm();
	const isLookingUpMatchingAnchorSites = useDetectMatchingAnchorSite();

	const handleSiteTitleSubmit = () => {
		if ( hasSiteTitle() && isGoodDefaultDomainQuery( getSelectedSiteTitle() ) ) {
			setDomainSearch( getSelectedSiteTitle() );
		}
		goNext();
	};

	const handleSiteTitleSkip = () => {
		setSiteTitle( '' );
		recordSiteTitleSkip();
		goNext();
	};

	// declare UI elements here to avoid duplication when returning for mobile/desktop layouts
	const nextStepButton = hasSiteTitle() ? (
		<NextButton onClick={ handleSiteTitleSubmit }>{ __( 'Continue' ) }</NextButton>
	) : (
		<SkipButton onClick={ handleSiteTitleSkip }>{ __( 'Skip for now' ) }</SkipButton>
	);

	// In the FSE Beta flow, AcquireIntent becomes the second step, and it gains a BackButton.
	if ( useFseBetaOptInStep() ) {
		return (
			<div className="gutenboarding-page acquire-intent">
				<SiteTitle inputRef={ siteTitleRef } onSubmit={ handleSiteTitleSubmit } />

				<ActionButtons className="acquire-intent__footer">
					<BackButton onClick={ goBack } />
					{ nextStepButton }
				</ActionButtons>
			</div>
		);
	}

	// In the case of an Anchor signup, we ask the backend to see if they already
	// have an anchor site. If we're still waiting for this response, don't show anything yet.
	if ( isAnchorFm && isLookingUpMatchingAnchorSites ) {
		return <div className="gutenboarding-page acquire-intent" />;
	}

	return (
		<div className="gutenboarding-page acquire-intent">
			<SiteTitle inputRef={ siteTitleRef } onSubmit={ handleSiteTitleSubmit } />
			<div className="acquire-intent__footer">{ nextStepButton }</div>
		</div>
	);
};

export default AcquireIntent;

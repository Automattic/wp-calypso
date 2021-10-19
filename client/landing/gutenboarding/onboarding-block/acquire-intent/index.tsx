import config from '@automattic/calypso-config';
import { isGoodDefaultDomainQuery } from '@automattic/domain-picker';
import { SkipButton, NextButton, ActionButtons, BackButton } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import useDetectMatchingAnchorSite from '../../hooks/use-detect-matching-anchor-site';
import useFseBetaOptInStep from '../../hooks/use-fse-beta-opt-in-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { recordVerticalSkip, recordSiteTitleSkip } from '../../lib/analytics';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY } from '../../stores/onboard';
import Arrow from './arrow';
import FseBetaOptIn from './fse-beta-opt-in';
import SiteTitle from './site-title';
import VerticalSelect from './vertical-select';

import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const {
		getSelectedVertical,
		getSelectedSiteTitle,
		wasVerticalSkipped,
		hasSiteTitle,
	} = useSelect( ( select ) => select( STORE_KEY ) );

	const siteTitleRef = React.useRef< HTMLInputElement >();

	const { skipSiteVertical, setDomainSearch, setSiteTitle } = useDispatch( STORE_KEY );

	const [ isSiteTitleActive, setIsSiteTitleActive ] = React.useState( false );

	const isMobile = useViewportMatch( 'small', '<' );

	const { goNext } = useStepNavigation();

	const showSiteTitleAndNext = !! (
		getSelectedVertical() ||
		hasSiteTitle() ||
		wasVerticalSkipped()
	);

	useTrackStep( 'IntentGathering', () => ( {
		selected_vertical_slug: getSelectedVertical()?.slug,
		selected_vertical_label: getSelectedVertical()?.label,
		has_selected_site_title: hasSiteTitle(),
	} ) );

	// Allow Anchor Gutenboarding to check the backend for matching sites and redirect if found.
	const isAnchorFm = useIsAnchorFm();
	const isLookingUpMatchingAnchorSites = useDetectMatchingAnchorSite();

	const [
		isFseBetaOptInStep,
		isSiteEligibleForFseBeta,
		setIsFseBetaOptInStep,
	] = useFseBetaOptInStep();

	const handleSkip = () => {
		skipSiteVertical();
		recordVerticalSkip();
		setIsSiteTitleActive( true );
	};

	const onNext = () => {
		if ( isMobile ) {
			window.scrollTo( 0, 0 );
		}
		setIsSiteTitleActive( true );
		siteTitleRef.current?.focus();
	};

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
	const verticalSelect = <VerticalSelect onNext={ onNext } />;
	const siteTitleInput = showSiteTitleAndNext && (
		<SiteTitle inputRef={ siteTitleRef } onSubmit={ handleSiteTitleSubmit } />
	);
	const nextStepButton = hasSiteTitle() ? (
		<NextButton onClick={ handleSiteTitleSubmit }>{ __( 'Continue' ) }</NextButton>
	) : (
		<SkipButton onClick={ handleSiteTitleSkip }>{ __( 'Skip for now' ) }</SkipButton>
	);

	const skipButton = (
		<SkipButton className="acquire-intent__skip-vertical" onClick={ handleSkip }>
			{ __( 'I donʼt know' ) }
		</SkipButton>
	);

	const siteVertical = getSelectedVertical();

	const showVerticalInput = config.isEnabled( 'gutenboarding/show-vertical-input' );

	// In the case of an Anchor signup, we ask the backend to see if they already
	// have an anchor site. If we're still waiting for this response, don't show anything yet.
	if ( isAnchorFm && isLookingUpMatchingAnchorSites ) {
		return <div className="gutenboarding-page acquire-intent" />;
	}

	// The FSE Beta flow shows the opt-in step first, before AcquireIntent.
	if ( isSiteEligibleForFseBeta && isFseBetaOptInStep ) {
		return <FseBetaOptIn setVisible={ setIsFseBetaOptInStep } />;
	}
	// In the FSE Beta flow, AcquireIntent becomes the second step, and it gains a BackButton.
	if ( isSiteEligibleForFseBeta && ! isFseBetaOptInStep ) {
		return (
			<div className="gutenboarding-page acquire-intent">
				<SiteTitle inputRef={ siteTitleRef } onSubmit={ handleSiteTitleSubmit } />

				<ActionButtons className="acquire-intent__footer">
					<BackButton onClick={ () => setIsFseBetaOptInStep( true ) } />
					{ nextStepButton }
				</ActionButtons>
			</div>
		);
	}

	return (
		<div className="gutenboarding-page acquire-intent">
			{ showVerticalInput ? (
				<>
					{ isMobile &&
						( isSiteTitleActive ? (
							<div>
								<Arrow
									className="acquire-intent__mobile-back-arrow"
									transform="rotate(180)"
									onClick={ () => setIsSiteTitleActive( false ) }
									role="button"
								/>

								{ siteTitleInput }
							</div>
						) : (
							verticalSelect
						) ) }
					{ ! isMobile && (
						<>
							{ ! wasVerticalSkipped() && verticalSelect }
							{ siteTitleInput }
						</>
					) }
					<div className="acquire-intent__footer">
						{ /* On mobile we render skipButton on vertical step when there is no vertical with more than 2 characters selected which is the
						case when we render the Next arrow button next to the input. On site title step we always render nextStepButton */ }
						{ isMobile &&
							( isSiteTitleActive
								? nextStepButton
								: ( ( ! siteVertical || siteVertical?.label?.length < 3 ) && skipButton ) || (
										<Arrow
											className="acquire-intent__mobile-next-arrow"
											onClick={ onNext }
											role="button"
										/>
								  ) ) }

						{ /* On desktop we always render nextStepButton when we render site title
						Otherwise we render skipButton  */ }
						{ ! isMobile && ( showSiteTitleAndNext ? nextStepButton : skipButton ) }
					</div>
				</>
			) : (
				<>
					<SiteTitle inputRef={ siteTitleRef } onSubmit={ handleSiteTitleSubmit } />
					<div className="acquire-intent__footer">{ nextStepButton }</div>
				</>
			) }
		</div>
	);
};

export default AcquireIntent;

/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle, NextButton, BackButton } from '@automattic/onboarding';
import { Icon, external } from '@wordpress/icons';
import { ClipboardButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSiteDomains, useHasEcommercePlan } from '../../hooks';
import Confetti from './confetti';
import LaunchContext from '../../context';
import { LAUNCH_STORE, SITE_STORE } from '../../stores';

import './style.scss';

// Success is shown when the site is launched but also while the site is still launching.
// This view is technically going to be the selected view in the modal even while the user goes through the checkout flow (which is rendered on top of this view).
const Success: React.FunctionComponent = () => {
	const { redirectTo, siteId, getCurrentLaunchFlowUrl, isInIframe } = React.useContext(
		LaunchContext
	);

	const isSiteLaunching = useSelect(
		( select ) => select( SITE_STORE ).isSiteLaunching( siteId ),
		[]
	);

	const [ isSelectedPlanPaid, selectedDomain ] = useSelect( ( select ) => {
		const launchStore = select( LAUNCH_STORE );

		return [ launchStore.isSelectedPlanPaid(), launchStore.getSelectedDomain() ];
	}, [] );

	// Save the post before displaying the action buttons and launch succes message
	const [ isPostSaved, setIsPostSaved ] = React.useState( false );
	const { savePost } = useDispatch( 'core/editor' );

	React.useEffect( () => {
		const asyncSavePost = async () => {
			if ( ! isPostSaved ) {
				await savePost();
				setIsPostSaved( true );
			}
		};
		asyncSavePost();
	}, [ isPostSaved, savePost ] );

	const { unsetModalDismissible, hideModalTitle, closeFocusedLaunch } = useDispatch( LAUNCH_STORE );

	const { siteSubdomain, sitePrimaryDomain } = useSiteDomains();

	const [ displayedSiteUrl, setDisplayedSiteUrl ] = React.useState( '' );
	const [ hasCopied, setHasCopied ] = React.useState( false );

	// Show CTA buttons needed to dismiss the success view only if the user is not going to be redirected to /checkout after launch.
	// Conditions to show the CTA buttons:
	// 1. If the selected plan isn't Ecommerce.
	// 2. In wp-admin, for the free flow (no selected custom domain or paid plan).
	const isEcommerce = useHasEcommercePlan();
	const isFreeFlow = ! selectedDomain && ! isSelectedPlanPaid;
	const shouldShowCTAs = ! isEcommerce && ( isInIframe || isFreeFlow );

	React.useEffect( () => {
		setDisplayedSiteUrl( `https://${ sitePrimaryDomain?.domain }` );
	}, [ sitePrimaryDomain ] );

	// When in the Success view, the user can't dismiss the modal anymore,
	// and the modal title is hidden
	React.useEffect( () => {
		unsetModalDismissible();
		hideModalTitle();
	}, [ unsetModalDismissible, hideModalTitle ] );

	const continueEditing = () => {
		if ( isSelectedPlanPaid ) {
			// After a plan was purchased, we need to reload the page for plans data to be picked up by Jetpack Premium blocks
			// @TODO: see if there is a way to prevent reloading
			const pathName = new URL( getCurrentLaunchFlowUrl() || '' )?.pathname;
			redirectTo( pathName || `/page/${ siteSubdomain?.domain }/home` );
		} else {
			// If the site was launched without purchasing a paid plan, don't reload the page
			closeFocusedLaunch();
		}
	};

	const redirectToHome = () => {
		redirectTo( `/home/${ siteSubdomain?.domain }` );
	};

	const subtitleTextLaunching = __( 'Your site will be live shortly.', __i18n_text_domain__ );
	const subtitleTextLaunched = __(
		"Congratulations, your website is now live. We're excited to watch you grow with WordPress.",
		__i18n_text_domain__
	);

	const copyButtonLabelIdle = __( 'Copy Link', __i18n_text_domain__ );
	const copyButtonLabelActivated = __( 'Copied!', __i18n_text_domain__ );

	const isLaunchComplete = ! isSiteLaunching && isPostSaved;

	return (
		<div className="focused-launch-container focused-launch-success__wrapper">
			<Confetti className="focused-launch-success__confetti" />
			<Title tagName="h2">{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<SubTitle tagName="h3">
				{ isLaunchComplete ? subtitleTextLaunched : subtitleTextLaunching }
			</SubTitle>
			{ shouldShowCTAs && isLaunchComplete && (
				<>
					<div className="focused-launch-success__url-wrapper">
						<span className="focused-launch-success__url-field">{ displayedSiteUrl }</span>
						<a
							href={ displayedSiteUrl }
							target="_blank"
							rel="noopener noreferrer"
							className="focused-launch-success__url-link"
							// translators: text accessible to screen readers
							aria-label={ __( 'Visit site', __i18n_text_domain__ ) }
						>
							<Icon icon={ external } size={ 16 } />
						</a>
						<ClipboardButton
							text={ displayedSiteUrl }
							onCopy={ () => setHasCopied( true ) }
							onFinishCopy={ () => setHasCopied( false ) }
							className="focused-launch-success__url-copy-button"
						>
							{ hasCopied ? copyButtonLabelActivated : copyButtonLabelIdle }
						</ClipboardButton>
					</div>
					{ /* @TODO: at the moment this only works when the modal is in the block editor. */ }
					<NextButton
						onClick={ continueEditing }
						className="focused-launch-success__continue-editing-button"
					>
						{ __( 'Continue Editing', __i18n_text_domain__ ) }
					</NextButton>

					<BackButton onClick={ redirectToHome }>
						{ __( 'Back home', __i18n_text_domain__ ) }
					</BackButton>
				</>
			) }
		</div>
	);
};

export default Success;

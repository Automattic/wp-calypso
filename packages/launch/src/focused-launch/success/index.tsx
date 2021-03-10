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
import { useSiteDomains, useWillRedirectAfterSuccess } from '../../hooks';
import Confetti from './confetti';
import LaunchContext from '../../context';
import { LAUNCH_STORE, SITE_STORE } from '../../stores';

import './style.scss';

// Success is shown when the site is launched but also while the site is still launching.
// This view is technically going to be the selected view in the modal even while the user goes through the checkout flow (which is rendered on top of this view).
const Success: React.FunctionComponent = () => {
	const { redirectTo, siteId, getCurrentLaunchFlowUrl } = React.useContext( LaunchContext );

	const isSiteLaunching = useSelect(
		( select ) => select( SITE_STORE ).isSiteLaunching( siteId ),
		[]
	);

	const isSelectedPlanPaid = useSelect(
		( select ) => select( LAUNCH_STORE ).isSelectedPlanPaid(),
		[]
	);

	const { unsetModalDismissible, hideModalTitle, closeFocusedLaunch } = useDispatch( LAUNCH_STORE );

	const { siteSubdomain, sitePrimaryDomain } = useSiteDomains();

	const [ displayedSiteUrl, setDisplayedSiteUrl ] = React.useState( '' );
	const [ hasCopied, setHasCopied ] = React.useState( false );

	// if the user has an ecommerce plan or they're using focused launch from wp-admin
	// they will be automatically redirected to /checkout, in which case the CTAs are not needed
	const willUserBeRedirectedAutomatically = useWillRedirectAfterSuccess();

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

	return (
		<div className="focused-launch-container focused-launch-success__wrapper">
			<Confetti className="focused-launch-success__confetti" />
			<Title tagName="h2">{ __( 'Hooray!', __i18n_text_domain__ ) }</Title>
			<SubTitle tagName="h3">
				{ isSiteLaunching ? subtitleTextLaunching : subtitleTextLaunched }
			</SubTitle>
			{ ! willUserBeRedirectedAutomatically && ! isSiteLaunching && (
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

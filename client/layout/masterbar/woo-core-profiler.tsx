import config from '@automattic/calypso-config';
import { ProgressBar } from '@automattic/components';
import { Button } from '@wordpress/components';
import { getQueryArg } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { isWebUri } from 'valid-url';
import WooLogoRebrand2 from 'calypso/assets/images/icons/Woo_logo_color.svg';
import WooLogo from 'calypso/assets/images/icons/woocommerce-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './typekit';
import './woo.scss';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

// Masterbar for WooCommerce Core Profiler Jetpack step
const WooCoreProfilerMasterbar = ( { translate }: { translate: ( text: string ) => string } ) => {
	const currentQueryArguments = useSelector( getCurrentQueryArguments );
	const currentRoute = useSelector( getCurrentRoute );
	const redirectToOriginal = useSelector( getRedirectToOriginal );

	let redirectTo = null;
	let shouldShowProgressBar = true;
	let shouldShowNoThanks = true;
	switch ( currentRoute ) {
		case '/jetpack/connect/authorize':
			redirectTo = currentQueryArguments?.redirect_after_auth;
			break;
		case '/log-in/jetpack':
			redirectTo = getQueryArg( redirectToOriginal || '', 'redirect_after_auth' );
			break;
	}

	if (
		currentRoute === '/log-in/jetpack/lostpassword' ||
		( config.isEnabled( 'woocommerce/core-profiler-passwordless-auth' ) &&
			currentRoute === '/log-in/jetpack/link' ) ||
		currentQueryArguments?.lostpassword_flow
	) {
		shouldShowProgressBar = false;
		shouldShowNoThanks = false;
	}

	const logo = config.isEnabled( 'woocommerce/rebrand-2-0' ) ? (
		<SVGIcon
			name="woocommerce-logo"
			icon={ WooLogoRebrand2 }
			classes="masterbar__woo-client-logo"
			width="60"
			height="24"
			viewBox="0 0 60 24"
		/>
	) : (
		<SVGIcon
			name="woocommerce-logo"
			icon={ WooLogo }
			classes="masterbar__woo-client-logo"
			width="38"
			height="23"
			viewBox="0 0 38 23"
		/>
	);

	return (
		<Fragment>
			{ shouldShowProgressBar && <ProgressBar className="masterbar__progress-bar" value={ 95 } /> }
			<header className="masterbar masterbar__woo">
				<nav className="masterbar__woo-nav-wrapper">
					<ul className="masterbar__woo-nav">
						<li className="masterbar__woo-nav-item">
							<a href="https://woocommerce.com" className="masterbar__woo-link">
								{ logo }
							</a>
						</li>
						<li className="masterbar__woo-nav-item">
							{ shouldShowNoThanks && typeof redirectTo === 'string' && isWebUri( redirectTo ) && (
								<Button
									onClick={ () => {
										recordTracksEvent( 'calypso_jpc_wc_coreprofiler_skip', {
											page: currentRoute,
										} );
									} }
									href={ redirectTo }
									className="masterbar__no-thanks-button"
								>
									{ translate( 'No, Thanks' ) }
								</Button>
							) }
						</li>
					</ul>
				</nav>
			</header>
		</Fragment>
	);
};

export default localize( WooCoreProfilerMasterbar );

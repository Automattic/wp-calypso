import { ProgressBar } from '@automattic/components';
import { Button } from '@wordpress/components';
import { getQueryArg } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
// @ts-expect-error Missing definition
// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import validUrl from 'valid-url';
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
	const { redirectTo, shouldShowProgressBar, shouldShowNoThanks } = useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		let redirectTo = null;
		let shouldShowProgressBar = true;
		let shouldShowNoThanks = true;
		switch ( currentRoute ) {
			case '/jetpack/connect/authorize':
				redirectTo = getCurrentQueryArguments( state )?.redirect_after_auth;
			case '/log-in/jetpack':
				redirectTo = getQueryArg( getRedirectToOriginal( state ) || '', 'redirect_after_auth' );
			default:
		}

		if (
			currentRoute === '/log-in/jetpack/lostpassword' ||
			getCurrentQueryArguments( state )?.lostpassword_flow
		) {
			shouldShowProgressBar = false;
			shouldShowNoThanks = false;
		}

		return {
			redirectTo,
			shouldShowProgressBar,
			shouldShowNoThanks,
		};
	} );

	return (
		<Fragment>
			{ shouldShowProgressBar && <ProgressBar className="masterbar__progress-bar" value={ 95 } /> }
			<header className="masterbar masterbar__woo">
				<nav className="masterbar__woo-nav-wrapper">
					<ul className="masterbar__woo-nav">
						<li className="masterbar__woo-nav-item">
							<a href="https://woocommerce.com" className="masterbar__woo-link">
								<SVGIcon
									name="woocommerce-logo"
									icon={ WooLogo }
									classes="masterbar__woo-client-logo"
									width="38"
									height="23"
									viewBox="0 0 38 23"
								/>
							</a>
						</li>
						<li className="masterbar__woo-nav-item">
							{ shouldShowNoThanks &&
								typeof redirectTo === 'string' &&
								validUrl.isWebUri( redirectTo ) && (
									<Button
										onClick={ () => {
											recordTracksEvent( 'calypso_jpc_wc_coreprofiler_skip' );
											window.location.href = redirectTo;
										} }
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

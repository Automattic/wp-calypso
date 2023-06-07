import { ProgressBar } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import WooLogo from 'calypso/assets/images/icons/woocommerce-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './typekit';
import './woo.scss';
import { useSelector } from 'calypso/state';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';

// Masterbar for WooCommerce Core Profiler Jetpack step
const WooCoreProfilerMasterbar = ( { translate }: { translate: ( text: string ) => string } ) => {
	// Get the redirect URL from the state. It should be set by the Jetpack Connection screen
	const redirectToSanitized = useSelector( ( state ) => getRedirectToOriginal( state ) );

	return (
		<Fragment>
			<ProgressBar className="masterbar__progress-bar" value={ 95 } />
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
							{ redirectToSanitized && (
								<Button href={ redirectToSanitized } className="masterbar__no-thanks-button">
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

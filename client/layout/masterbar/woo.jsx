import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { createInterpolateElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './typekit';
import './woo.scss';

const WooOauthMasterbar = () => {
	function goBack() {
		window.history.back();
	}

	function onClick() {
		// When the URL that initiates login is the connection page (during a switch user flow),
		// we need to find the deeply nested home_url parameter to redirect back to the
		// extensions page. This is because otherwise history back() will just redirect back to
		// login as we still don't have a user. At any stage if we're not able to find a
		// parameter, we give up and go back.
		try {
			const url = new URL( window.location.href );
			const redirectURL = new URL( url.searchParams.get( 'redirect_to' ) );
			const siteURL = new URL( redirectURL.searchParams.get( 'redirect_uri' ) );
			// We just get a path here, so we construct an example URL.
			const nextURL = new URL( 'http://example.com' + siteURL.searchParams.get( 'next' ) );
			// Validate the URL and get it back as a string.
			const homeURL = new URL( nextURL.searchParams.get( 'home_url' ) ).toString();
			// add the extensions page path.
			const finalRedirectURL = `${ homeURL }wp-admin/admin.php?page=wc-admin&tab=my-subscriptions&path=%2Fextensions`;
			window.location = finalRedirectURL;
		} catch {
			goBack();
		}
	}

	const backNav = (
		<li className="masterbar__woo-nav-item">
			<Button className="masterbar__login-back-link" onClick={ onClick }>
				{ createInterpolateElement( __( '<arrow/> Back' ), {
					arrow: <Gridicon icon="chevron-left" size={ 18 } />,
				} ) }
			</Button>
		</li>
	);

	return (
		<Fragment>
			<header className="masterbar masterbar__woo">
				<nav className="masterbar__woo-nav-wrapper">
					<ul className="masterbar__woo-nav">
						<li className="masterbar__woo-nav-item">
							<a href="https://woocommerce.com" className="masterbar__woo-link">
								<SVGIcon
									name="woocommerce-logo"
									icon={ WooLogo }
									classes="masterbar__woo-client-logo"
									width="64"
									height="24"
									viewBox="0 0 64 24"
								/>
							</a>
						</li>
						{ backNav }
					</ul>
				</nav>
			</header>
			<div className="masterbar__woo-mobile-nav">{ backNav }</div>
		</Fragment>
	);
};

export default localize( WooOauthMasterbar );

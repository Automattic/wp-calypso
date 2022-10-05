import { Gridicon } from '@automattic/components';
import { createInterpolateElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import WooLogo from 'calypso/assets/images/icons/woocommerce-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './typekit';
import './woo.scss';

const WooOauthMasterbar = () => {
	const backNav = (
		<li className="masterbar__woo-nav-item">
			<a className="masterbar__login-back-link" href="https://woocommerce.com">
				{ createInterpolateElement( __( '<arrow/> Back' ), {
					arrow: <Gridicon icon="chevron-left" size={ 18 } />,
				} ) }
			</a>
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
									width="38"
									height="23"
									viewBox="0 0 38 23"
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

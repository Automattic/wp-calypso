import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import WooLogo from 'calypso/assets/images/icons/woocommerce-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './woo.scss';

const WooOauthMasterbar = () => {
	return (
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
						<Button
							className="masterbar__go-back"
							href="https://woocommerce.com"
							icon={ chevronLeft }
						>
							{ __( 'Back' ) }
						</Button>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default localize( WooOauthMasterbar );

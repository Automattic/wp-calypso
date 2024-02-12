import { Gridicon } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import BlazeProLogo from 'calypso/assets/images/icons/blaze-pro-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './typekit';
import './blaze-pro.scss';

const BlazeProOauthMasterbar = () => {
	const backNav = (
		<li className="masterbar__blaze-pro-nav-item">
			{ /* TODO: Change address to the right one */ }
			<a className="masterbar__login-back-link" href="https://advertising.tumblr.com">
				{ createInterpolateElement( __( '<arrow/> Back' ), {
					arrow: <Gridicon icon="chevron-left" size={ 18 } />,
				} ) }
			</a>
		</li>
	);

	return (
		<>
			<header className="masterbar masterbar__blaze-pro">
				<nav className="masterbar__blaze-pro-nav-wrapper">
					<ul className="masterbar__blaze-pro-nav">
						<li className="masterbar__blaze-pro-nav-item">
							{ /* TODO: Change address to the right one */ }
							<a href="https://advertising.tumblr.com" className="masterbar__blaze-pro-link">
								<SVGIcon
									name="blaze-pro-logo"
									icon={ BlazeProLogo }
									classes="masterbar__blaze-pro-client-logo"
									width="122"
									height="32"
									viewBox="0 0 122 32"
								/>
							</a>
						</li>
						{ backNav }
					</ul>
				</nav>
			</header>
			{ /* <div className="masterbar__blaze-pro-mobile-nav">{ backNav }</div> */ }
		</>
	);
};

export default localize( BlazeProOauthMasterbar );

import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { createInterpolateElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import BlazeProLogo from 'calypso/assets/images/blaze/blaze-pro-logo.png';
import './typekit';
import './blaze-pro.scss';

const BlazeProOauthMasterbar = () => {
	function onClick() {
		if ( document.referrer ) {
			window.location.href = document.referrer;
		} else {
			window.history.back();
		}
	}

	const backNav = (
		<li className="masterbar__blaze-pro-nav-item">
			<Button className="masterbar__login-back-link" onClick={ onClick }>
				{ createInterpolateElement( __( '<arrow/> Back' ), {
					arrow: <Gridicon icon="chevron-left" size={ 18 } />,
				} ) }
			</Button>
		</li>
	);

	return (
		<Fragment>
			<header className="masterbar masterbar__blaze-pro">
				<nav className="masterbar__blaze-pro-nav-wrapper">
					<ul className="masterbar__blaze-pro-nav">
						<li className="masterbar__blaze-pro-nav-item">
							<a href={ config( 'blaze_pro_back_link' ) } className="masterbar__blaze-pro-link">
								<img src={ BlazeProLogo } alt="Blaze Pro" width="40" />
							</a>
						</li>
						{ backNav }
					</ul>
				</nav>
			</header>
			<div className="masterbar__blaze-pro-mobile-nav">{ backNav }</div>
		</Fragment>
	);
};

export default localize( BlazeProOauthMasterbar );

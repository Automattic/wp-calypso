import { AkismetLogo, GravatarLogo, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	isAkismetOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarOAuth2Client,
	isWooOAuth2Client,
	isJetpackCloudOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import CrowdsignalOauthMasterbar from './crowdsignal';
import WooOauthMasterbar from './woo';
import './oauth-client.scss';

const OauthClientLogo = ( { oauth2Client } ) => {
	if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
		return <JetpackLogo full monochrome={ false } size={ 28 } />;
	}

	if ( isAkismetOAuth2Client( oauth2Client ) ) {
		return <AkismetLogo size={ 28 } />;
	}

	if ( isGravatarOAuth2Client( oauth2Client ) ) {
		return <GravatarLogo size={ 28 } />;
	}

	// Other clients can define their own logos
	if ( oauth2Client.icon ) {
		return <img src={ oauth2Client.icon } alt={ oauth2Client.title || '' } />;
	}

	return null;
};

const DefaultOauthClientMasterbar = ( { oauth2Client } ) => (
	<header className="masterbar masterbar__oauth-client">
		<nav>
			<ul className="masterbar__oauth-client-main-nav">
				<li className="masterbar__oauth-client-current">
					<div className="masterbar__oauth-client-logo">
						<OauthClientLogo oauth2Client={ oauth2Client } />
					</div>
				</li>

				{ isWooOAuth2Client( oauth2Client ) && (
					<li className="masterbar__oauth-client-close">
						<a href="https://woocommerce.com">
							Cancel <span>X</span>
						</a>
					</li>
				) }

				{ ! isWooOAuth2Client( oauth2Client ) &&
					! isJetpackCloudOAuth2Client( oauth2Client ) &&
					! isAkismetOAuth2Client( oauth2Client ) &&
					! isGravatarOAuth2Client( oauth2Client ) && (
						<li className="masterbar__oauth-client-wpcc-sign-in">
							<a
								href={ localizeUrl( 'https://wordpress.com/' ) }
								className="masterbar__oauth-client-wpcom"
								target="_self"
							>
								<Gridicon icon="my-sites" size={ 24 } />
								WordPress.com
							</a>
						</li>
					) }
			</ul>
		</nav>
	</header>
);

const OauthClientMasterbar = ( { oauth2Client } ) => {
	if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		return <CrowdsignalOauthMasterbar oauth2Client={ oauth2Client } />;
	}

	if ( isWooOAuth2Client( oauth2Client ) ) {
		return <WooOauthMasterbar />;
	}

	return <DefaultOauthClientMasterbar oauth2Client={ oauth2Client } />;
};

OauthClientMasterbar.displayName = 'OauthClientMasterbar';
OauthClientMasterbar.propTypes = {
	oauth2Client: PropTypes.object,
};

export default OauthClientMasterbar;

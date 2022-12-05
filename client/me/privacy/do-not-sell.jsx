import { Card } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { ToggleControl, ExternalLink } from '@wordpress/components';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import SectionHeader from 'calypso/components/section-header';
import {
	refreshCountryCodeCookieGdpr,
	setTrackingPrefs,
	getTrackingPrefs,
} from 'calypso/lib/analytics/utils';
import isRegionInCcpaZone from 'calypso/lib/analytics/utils/is-region-in-ccpa-zone';

const useDoNotSellHelper = () => {
	const isCookieBannerAccepted = getTrackingPrefs().ok;
	const [ shouldShowSetting, setShouldShowSetting ] = useState( false );
	const [ isDoNotSellEnabled, setDoNotSellEnabled ] = useState(
		! getTrackingPrefs().buckets.advertising
	);

	useEffect( () => {
		refreshCountryCodeCookieGdpr().then( () => {
			const cookies = cookie.parse( document.cookie );
			setShouldShowSetting( isRegionInCcpaZone( cookies.country_code, cookies.region ) );
		} );
	}, [ setShouldShowSetting ] );

	const handleSetDoNotSell = useCallback(
		( isEnabled ) => {
			const prefs = setTrackingPrefs( { buckets: { advertising: ! isEnabled } } );
			setDoNotSellEnabled( ! prefs.buckets.advertising );
		},
		[ setDoNotSellEnabled ]
	);

	return {
		shouldShowSetting,
		handleSetDoNotSell,
		isDoNotSellEnabled,
		isCookieBannerAccepted,
	};
};

export const DoNotSellSetting = () => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { shouldShowSetting, handleSetDoNotSell, isDoNotSellEnabled, isCookieBannerAccepted } =
		useDoNotSellHelper();

	const cookiePolicyLink = (
		<ExternalLink href={ localizeUrl( 'https://automattic.com/cookies/' ) } target="_blank" />
	);
	const privacyPolicyLink = (
		<ExternalLink href={ localizeUrl( 'https://automattic.com/privacy/' ) } target="_blank" />
	);
	const contactLink = (
		<ExternalLink href="mailto:contact@automattic.com" target="_blank">
			contact@automattic.com
		</ExternalLink>
	);

	if ( ! shouldShowSetting ) {
		return null;
	}

	return (
		<>
			<SectionHeader label={ translate( 'Do Not Sell or Share My Data' ) } />
			<Card className="privacy__settings">
				<p>
					{ translate(
						'Your privacy is critically important to us so we strive to be transparent in how we are collecting, using, and sharing your information. We use cookies and other technologies to help us identify and track visitors to our sites, to store usage and access preferences for our services, to track and understand email campaign effectiveness, and to deliver targeted ads. Learn more in our {{privacyPolicyLink}}Privacy Policy{{/privacyPolicyLink}} and our {{cookiePolicyLink}}Cookie Policy{{/cookiePolicyLink}}.',
						{
							components: {
								cookiePolicyLink,
								privacyPolicyLink,
							},
						}
					) }
				</p>
				<p>
					{ translate(
						'Like many websites, we share some of the data we collect through cookies with certain third party advertising and analytics vendors. The personal information we share includes online identifiers; internet or other network or device activity (such as cookie information, other device identifiers, and IP address); and geolocation data (approximate location information from your IP address). We do not share information that identifies you personally, like your name or contact information.'
					) }
				</p>
				<p>
					{ translate(
						'We never directly sell your personal information in the conventional sense (i.e., for money), but in some U.S. states the sharing of your information with advertising/analytics vendors can be considered a “sale” of your information, which you may have the right to opt out of. To opt out, click the link below.'
					) }
				</p>
				<p>
					{ translate(
						'Our opt-out is managed through cookies, so if you delete cookies, your browser is set to delete cookies automatically after a certain length of time, or if you visit sites in a different browser, you’ll need to make this selection again.'
					) }
				</p>
				<p>
					{ translate(
						'If you have any questions about this opt out, or how we honor your legal rights, you can contact us at {{contactLink /}}',
						{ components: { contactLink } }
					) }
				</p>
				<hr />
				<ToggleControl
					id="advertising_opt_out"
					checked={ isDoNotSellEnabled }
					onChange={ handleSetDoNotSell }
					label={ translate( 'Do Not Sell or Share My Data' ) }
					disabled={ ! isCookieBannerAccepted }
				/>
			</Card>
		</>
	);
};

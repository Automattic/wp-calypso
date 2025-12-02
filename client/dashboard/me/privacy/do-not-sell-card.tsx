import { userSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ExternalLink, ToggleControl } from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useIsRegionInCcpaZone } from '../../app/analytics/country-code-cookie-gdpr';
import { getTrackingPrefs, setTrackingPrefs } from '../../app/analytics/tracking-preferences';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

export default function DoNotSellCard() {
	const { recordTracksEvent } = useAnalytics();
	const isRegionInCcpaZone = useIsRegionInCcpaZone();
	const mutation = useMutation( userSettingsMutation() );

	if ( ! isRegionInCcpaZone ) {
		return null;
	}

	const handleChange = ( {
		advertising_targeting_opt_out,
	}: {
		advertising_targeting_opt_out?: boolean;
	} ) => {
		// Update the preferences in the cookie.
		setTrackingPrefs( { ok: true, buckets: { advertising: ! advertising_targeting_opt_out } } );

		// Should fail quietly in the event they have an expired 2FA token
		// and a success notification is not standard when accepting or denying cookies.
		mutation.mutate( { advertising_targeting_opt_out } );

		if ( advertising_targeting_opt_out ) {
			recordTracksEvent( 'a8c_ccpa_optout', {
				source: 'calypso',
				hostname: window.location.hostname,
				pathname: window.location.pathname,
			} );
		}
	};

	const fields: Field< { advertising_targeting_opt_out: boolean } >[] = [
		{
			id: 'advertising_targeting_opt_out',
			label: __( 'Do not sell or share my data' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, label, getValue } = field;
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={ hideLabelFromVision ? '' : label }
						checked={ getValue( { item: data } ) }
						disabled={ mutation.isPending }
						onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
					/>
				);
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'advertising_targeting_opt_out' ],
	};

	const data = {
		advertising_targeting_opt_out: ! getTrackingPrefs().buckets.advertising,
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Do not sell or share my data' ) }
						description={
							<VStack spacing={ 4 }>
								<Text variant="muted" lineHeight="20px">
									{ createInterpolateElement(
										__(
											'Your privacy is critically important to us so we strive to be transparent in how we are collecting, using, and sharing your information. We use cookies and other technologies to help us identify and track visitors to our sites, to store usage and access preferences for our services, to track and understand email campaign effectiveness, and to deliver targeted ads. Learn more in our <privacyLink>privacy policy</privacyLink> and our <cookiesLink>cookie policy</cookiesLink>'
										),
										{
											privacyLink: (
												<ExternalLink
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://automattic.com/privacy/"
													children={ null }
												/>
											),
											cookiesLink: (
												<ExternalLink
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://automattic.com/cookies/"
													children={ null }
												/>
											),
										}
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ __(
										'Like many websites, we share some of the data we collect through cookies with certain third party advertising and analytics vendors. The personal information we share includes online identifiers; internet or other network or device activity (such as cookie information, other device identifiers, and IP address); and geolocation data (approximate location information from your IP address). We do not share information that identifies you personally, like your name or contact information.'
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ __(
										'We never directly sell your personal information in the conventional sense (i.e., for money), but in some U.S. states the sharing of your information with advertising/analytics vendors can be considered a “sale” of your information, which you may have the right to opt out of. To opt out, click the link below.'
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ __(
										'Our opt-out is managed through cookies, so if you delete cookies, your browser is set to delete cookies automatically after a certain length of time, or if you visit sites in a different browser, you’ll need to make this selection again.'
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ createInterpolateElement(
										__(
											'If you have any questions about this opt out, or how we honor your legal rights, you can contact us at <emailLink>contact@automattic.com</emailLink>'
										),
										{
											emailLink: (
												<ExternalLink
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="mailto:contact@automattic.com"
													children={ null }
												/>
											),
										}
									) }
								</Text>
							</VStack>
						}
						level={ 3 }
					/>
					<DataForm< { advertising_targeting_opt_out: boolean } >
						data={ data }
						fields={ fields }
						form={ form }
						onChange={ handleChange }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}

import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ExternalLink, ToggleControl } from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

export default function UsageInformationCard() {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: ( _data, { tracks_opt_out } ) =>
				tracks_opt_out
					? __( 'Usage information sharing disabled.' )
					: __( 'Usage information sharing enabled.' ),
			error: ( _error, { tracks_opt_out } ) =>
				tracks_opt_out
					? __( 'Failed to disable usage information sharing.' )
					: __( 'Failed to enable usage information sharing.' ),
		} )
	);

	const handleChange = ( { tracks_opt_out }: { tracks_opt_out?: boolean } ) => {
		mutation.mutate( { tracks_opt_out } );
	};

	const fields: Field< { tracks_opt_out: boolean } >[] = [
		{
			id: 'tracks_opt_out',
			label: __( 'Enable usage information sharing' ),
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, label, getValue } = field;
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={ hideLabelFromVision ? '' : label }
						checked={ ! getValue( { item: data } ) }
						disabled={ mutation.isPending }
						onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
					/>
				);
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'tracks_opt_out' ],
	};

	const data = { tracks_opt_out: userSettings?.tracks_opt_out ?? true };

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Usage information' ) }
						description={
							<VStack spacing={ 4 }>
								<Text variant="muted" lineHeight="20px">
									{ __( 'We collect usage information to improve your experience.' ) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ createInterpolateElement(
										__(
											'The information you choose to share helps us improve our products, make marketing to you more relevant, personalize your WordPress.com experience, and more as detailed in our <privacyLink>privacy policy</privacyLink>'
										),
										{
											privacyLink: (
												<ExternalLink
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://automattic.com/privacy/"
													children={ null }
												/>
											),
										}
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ createInterpolateElement(
										__(
											'In addition to our own analytics tool, we use other tracking tools, including some from third parties. <cookiesLink>Read about these</cookiesLink> and how to control them.'
										),
										{
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
									{ createInterpolateElement(
										__(
											'This setting also covers how you use Jetpack on sites connected to your WordPress.com account. The <jetpackPrivacyLink>Jetpack Privacy Center</jetpackPrivacyLink> explains how specific Jetpack features use data.'
										),
										{
											jetpackPrivacyLink: (
												<ExternalLink
													href={ localizeUrl( 'https://jetpack.com/support/privacy/' ) }
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
					<DataForm< { tracks_opt_out: boolean } >
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

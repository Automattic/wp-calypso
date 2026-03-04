import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ExternalLink, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

export default function UsageInformationCard() {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const mutation = useMutation( userSettingsMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleChange = ( { tracks_opt_out }: { tracks_opt_out?: boolean } ) => {
		mutation.mutate(
			{ tracks_opt_out },
			{
				onSuccess: () => {
					createSuccessNotice(
						tracks_opt_out
							? __( 'Usage information sharing disabled.' )
							: __( 'Usage information sharing enabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice(
						tracks_opt_out
							? __( 'Failed to disable usage information sharing.' )
							: __( 'Failed to enable usage information sharing.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	const isOptedOut = userSettings?.tracks_opt_out ?? true;

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
							</VStack>
						}
						level={ 3 }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Enable usage information sharing' ) }
						checked={ ! isOptedOut }
						disabled={ mutation.isPending }
						onChange={ () => handleChange( { tracks_opt_out: ! isOptedOut } ) }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}

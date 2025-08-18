import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Card,
	CardBody,
	ExternalLink,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { profileMutation, profileQuery } from '../../app/queries/me-profile';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

export default function UsageInformationCard() {
	const { data: userProfile } = useQuery( profileQuery() );
	const mutation = useMutation( profileMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleChange = ( { enabled }: { enabled?: boolean } ) => {
		const tracksOptOut = ! enabled;
		mutation.mutate(
			{ tracks_opt_out: tracksOptOut },
			{
				onSuccess: () => {
					createSuccessNotice(
						tracksOptOut
							? __( 'Usage information sharing disabled.' )
							: __( 'Usage information sharing enabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice(
						tracksOptOut
							? __( 'Failed to disable usage information sharing.' )
							: __( 'Failed to enable usage information sharing.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	const fields: Field< { enabled: boolean } >[] = [
		{
			id: 'enabled',
			label: __(
				'Share information with our analytics tool about your use of services while logged in to your WordPress.com account.'
			),
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
		type: 'regular' as const,
		fields: [ 'enabled' ],
	};

	const data = { enabled: ! userProfile?.tracks_opt_out };

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
					<DataForm< { enabled: boolean } >
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

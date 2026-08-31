import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ToggleControl,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody } from '../../components/card';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { wpcomLink } from '../../utils/link';

export default function HostingDashboard() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const { mutate: saveOptInPreference, isPending } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-opt-in' )
	);

	const isEnabled = optIn.value === 'opt-in';

	const handleToggle = ( enabled: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_me_preferences_new_hosting_dashboard_toggle_click', {
			enabled,
		} );

		recordTracksEvent( 'calypso_dashboard_me_preferences_new_hosting_dashboard_submit', {
			enabled,
		} );

		saveOptInPreference(
			{
				value: enabled ? 'opt-in' : 'opt-out',
				updated_at: new Date().toISOString(),
			},
			{
				onSuccess( _, data ) {
					if ( data?.value === 'opt-in' ) {
						createSuccessNotice( __( 'New Hosting Dashboard enabled.' ), {
							type: 'snackbar',
						} );
					} else {
						createSuccessNotice( __( 'New Hosting Dashboard disabled.' ), {
							type: 'snackbar',
						} );
					}
				},
				onError( _, data ) {
					createErrorNotice(
						data?.value === 'opt-in'
							? __( 'Failed to enable New Hosting Dashboard.' )
							: __( 'Failed to disable New Hosting Dashboard.' ),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'New Hosting Dashboard' ) }
					description={ __(
						'Opt in for a modern design and smarter tools for managing your hosting.'
					) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 } alignment="flex-start">
							<SectionHeader
								title={ __( 'New hosting dashboard' ) }
								description={ __(
									"We've recently updated the dashboard with a modern design and smarter tools for managing your hosting."
								) }
								level={ 3 }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ isEnabled }
								label={ __( 'Enable new hosting dashboard' ) }
								disabled={ isPending }
								onChange={ handleToggle }
							/>
						</VStack>
					</CardBody>
				</Card>
				{ ! isEnabled && (
					<Notice
						title={ __( 'Prefer the previous version?' ) }
						variant="info"
						actions={
							<Button variant="primary" __next40pxDefaultSize href={ wpcomLink( '/me/account' ) }>
								{ __( 'Return to previous version' ) }
							</Button>
						}
					>
						{ createInterpolateElement(
							__(
								"<surveyLink>Please complete this short survey</surveyLink> to help us understand what didn't work and how we can improve."
							),
							{
								surveyLink: (
									<ExternalLink
										href="https://automattic.survey.fm/msd-survey-for-opt-out"
										onClick={ () =>
											recordTracksEvent(
												'calypso_dashboard_me_preferences_new_hosting_dashboard_survey_click'
											)
										}
										children={ null }
									/>
								),
							}
						) }
					</Notice>
				) }
			</VStack>
		</PageLayout>
	);
}

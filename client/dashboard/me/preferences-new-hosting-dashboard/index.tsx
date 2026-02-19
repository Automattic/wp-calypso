import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ExternalLink, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody } from '../../components/card';
import FlashMessage from '../../components/flash-message';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { wpcomLink } from '../../utils/link';

const OLDEST_ELIGIBLE_USER: number = config( 'dashboard_opt_in_oldest_eligible_user' ); // Cut-off on 22 December 2025

export default function PreferencesOptInForm() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const { mutate: saveOptInPreference, isPending } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-opt-in' )
	);
	const [ isRedirecting, setIsRedirecting ] = useState( false );

	const isEnabled = optIn.value === 'opt-in';

	const handleToggle = ( enabled: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_me_preferences_new_hosting_dashboard_toggle_click', {
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
						createSuccessNotice( __( 'New Hosting Dashboard enabled.' ), { type: 'snackbar' } );
					} else {
						setIsRedirecting( true );
						window.location.href = wpcomLink( '/me/account?flash=dashboard' );
					}
				},
				onError( _, data ) {
					createErrorNotice(
						data?.value === 'opt-in'
							? __( 'Failed to enable new Hosting Dashboard.' )
							: __( 'Failed to disable new Hosting Dashboard.' ),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
	};

	// Only users created before 22 December 2025 can manually opt in or out.
	if ( user.ID > OLDEST_ELIGIBLE_USER ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'New hosting dashboard' ) }
				/>
			}
		>
			<Card>
				<FlashMessage id="dashboard" message={ __( 'New Hosting Dashboard enabled.' ) } />
				<CardBody>
					<VStack spacing={ 8 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'New hosting dashboard' ) }
							description={ __(
								"We've recently updated the dashboard with a modern design and smarter tools for managing your hosting."
							) }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							checked={ isEnabled }
							label={ __( 'Enable new hosting dashboard' ) }
							disabled={ isPending || isRedirecting }
							onChange={ handleToggle }
						/>
					</VStack>
				</CardBody>
			</Card>
			{ ! isEnabled && isRedirecting && (
				<Card>
					<CardBody>
						<Notice title={ __( 'Prefer the previous version?' ) } variant="info">
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
					</CardBody>
				</Card>
			) }
		</PageLayout>
	);
}

import { activeAgencyQuery, amplifyReportsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import AmplifyDevStateControls, {
	makePreviewReports,
	useAmplifyDevSettings,
} from './dev-state-controls';
import AmplifyNewReportModal from './new-report-modal';
import AmplifyReportCreator from './report-creator';
import AmplifyReportsList from './reports';
import './style.scss';

export default function AgencyAmplify() {
	const isDevelopment = process.env.NODE_ENV === 'development';
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const reportsQuery = useQuery( amplifyReportsQuery( agencyId ) );
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState( false );
	const [ devSettings, setDevSettings, areDevSettingsReady ] =
		useAmplifyDevSettings( isDevelopment );
	const previewReports = useMemo(
		() => makePreviewReports( devSettings.mode === 'one' ? 1 : 24 ),
		[ devSettings.mode ]
	);
	// Review links can set the preview persona once on load.
	useEffect( () => {
		if ( ! isDevelopment || ! areDevSettingsReady ) {
			return;
		}
		const searchParams = new URLSearchParams( window.location.search );
		const urlState = searchParams.get( 'state' );
		if ( urlState !== 'first' && urlState !== 'one' ) {
			return;
		}
		setDevSettings( ( previous ) => ( {
			...previous,
			mode: urlState,
		} ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ areDevSettingsReady ] );
	const devMode = devSettings.mode;
	const mode = isDevelopment && areDevSettingsReady ? devMode : 'live';
	const liveReports = reportsQuery.data?.reports ?? [];
	const reports = mode === 'one' || mode === 'dozens' ? previewReports : liveReports;
	let state: 'empty' | 'reports' | 'loading' | 'error' = 'empty';
	if ( mode === 'one' || mode === 'dozens' ) {
		state = 'reports';
	} else if ( mode === 'first' ) {
		state = 'empty';
	} else if ( mode === 'loading' || mode === 'error' ) {
		state = mode;
	} else if ( agency === undefined || reportsQuery.isLoading ) {
		state = 'loading';
	} else if ( reportsQuery.isError && ! reportsQuery.data ) {
		state = 'error';
	} else if ( reports.length > 0 ) {
		state = 'reports';
	}
	const isPreview = mode !== 'live';

	const openNewReport = () => {
		recordTracksEvent( 'calypso_a4a_amplify_new_report_click' );
		setIsNewReportOpen( true );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Amplify' ) }
					description={ __( 'Homepage reports for pitches and client check-ins.' ) }
					actions={
						state !== 'empty' ? (
							<Button variant="primary" onClick={ openNewReport }>
								{ __( 'New report' ) }
							</Button>
						) : undefined
					}
				/>
			}
		>
			<div className="dashboard-amplify-view">
				{ state === 'empty' && (
					<EmptyState.Wrapper>
						<EmptyState>
							<AmplifyReportCreator
								agencyId={ agencyId }
								usage={ reportsQuery.data?.usage }
								onCreated={ () => {
									if ( isDevelopment ) {
										setDevSettings( ( previous ) => ( { ...previous, mode: 'live' } ) );
									}
								} }
							/>
						</EmptyState>
					</EmptyState.Wrapper>
				) }
				{ state === 'reports' && (
					<div className="dashboard-amplify-results">
						<AmplifyReportsList agencyId={ agencyId } reports={ reports } isPreview={ isPreview } />
					</div>
				) }
				{ state === 'loading' && (
					<AmplifyReportsList agencyId={ agencyId } reports={ [] } isLoading />
				) }
				{ state === 'error' && (
					<div className="dashboard-amplify-results__error" role="alert">
						<Text>{ __( 'Unable to load reports. Please try again.' ) }</Text>
						{ mode === 'live' && (
							<Button variant="secondary" onClick={ () => reportsQuery.refetch() }>
								{ __( 'Retry' ) }
							</Button>
						) }
					</div>
				) }
			</div>
			{ isNewReportOpen && (
				<AmplifyNewReportModal
					agencyId={ agencyId }
					usage={ reportsQuery.data?.usage }
					onClose={ () => setIsNewReportOpen( false ) }
					onCreated={ () => {
						setIsNewReportOpen( false );
						if ( isDevelopment ) {
							setDevSettings( ( previous ) => ( { ...previous, mode: 'live' } ) );
						}
					} }
				/>
			) }
			{ isDevelopment && areDevSettingsReady && (
				<AmplifyDevStateControls settings={ devSettings } onChange={ setDevSettings } />
			) }
		</PageLayout>
	);
}

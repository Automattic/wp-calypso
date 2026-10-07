import { activeAgencyQuery, amplifyReportsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, Tooltip, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { getFeatureName } from './constants';
import AmplifyDevStateControls, {
	makePreviewReports,
	makePreviewUsage,
	useAmplifyDevSettings,
} from './dev-state-controls';
import AmplifyLearnMoreModal from './learn-more-modal';
import AmplifyNewReportModal from './new-report-modal';
import AmplifyReportCreator from './report-creator';
import AmplifyReportsList from './reports';
import { canStartScan, getUsageStatus } from './usage';
import { AmplifyLimitNotice, AmplifyUsageMeter } from './usage-meter';
import './style.scss';

export default function AgencyAmplify() {
	const isDevelopment = process.env.NODE_ENV === 'development';
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const reportsQuery = useQuery( amplifyReportsQuery( agencyId ) );
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState( false );
	const [ isLearnMoreOpen, setIsLearnMoreOpen ] = useState( false );
	const [ notActivated, setNotActivated ] = useState( false );
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
	const usagePreview =
		isDevelopment && areDevSettingsReady ? makePreviewUsage( devSettings.usage ) : null;
	const usage = usagePreview ? usagePreview.usage : reportsQuery.data?.usage;
	const tierId = usagePreview ? usagePreview.tierId : agency?.tier?.id;
	const usageStatus = getUsageStatus( usage, {
		approvalStatus: usagePreview ? usagePreview.approvalStatus : agency?.approval_status,
		notActivated: ! usagePreview && notActivated,
	} );
	const canScan = canStartScan( usageStatus );
	// Only awaiting review, not approved, and the monthly cap have a notice.
	const limitNotice = canScan ? null : (
		<AmplifyLimitNotice
			agencyId={ agencyId }
			usage={ usage }
			status={ usageStatus }
			tierId={ tierId }
		/>
	);
	const handleUsageError = ( code: string ) => {
		if ( code === 'amplify_account_not_activated' ) {
			setNotActivated( true );
		}
		reportsQuery.refetch();
	};

	const openNewReport = () => {
		recordTracksEvent( 'calypso_a4a_amplify_new_report_click' );
		setIsNewReportOpen( true );
	};
	let newReportButton = (
		<Button
			variant="primary"
			onClick={ openNewReport }
			disabled={ ! canScan }
			accessibleWhenDisabled
		>
			{ __( 'New report' ) }
		</Button>
	);
	if ( ! canScan ) {
		newReportButton = (
			<Tooltip
				text={
					usageStatus === 'cap'
						? __( 'You’ve used all your audits for this month.' )
						: __( 'Audits unlock once your account is activated.' )
				}
			>
				{ newReportButton }
			</Tooltip>
		);
	}
	const openLearnMore = () => {
		recordTracksEvent( 'calypso_a4a_amplify_learn_more_click' );
		setIsLearnMoreOpen( true );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ getFeatureName() }
					description={ __(
						'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fix.'
					) }
					actions={
						state !== 'empty' ? (
							<HStack spacing={ 4 } alignment="center" expanded={ false }>
								<AmplifyUsageMeter usage={ usage } status={ usageStatus } />
								{ state === 'reports' && (
									<Button
										variant="tertiary"
										className="dashboard-amplify-learn-more-button"
										onClick={ openLearnMore }
									>
										{ __( 'Learn more' ) }
									</Button>
								) }
								{ newReportButton }
							</HStack>
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
								canScan={ canScan }
								usage={ usage }
								usageStatus={ usageStatus }
								limitNotice={ limitNotice }
								onUsageError={ handleUsageError }
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
						{ limitNotice }
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
					canScan={ canScan }
					usage={ usage }
					usageStatus={ usageStatus }
					limitNotice={ limitNotice }
					onUsageError={ handleUsageError }
					onClose={ () => setIsNewReportOpen( false ) }
					onCreated={ () => {
						setIsNewReportOpen( false );
						if ( isDevelopment ) {
							setDevSettings( ( previous ) => ( { ...previous, mode: 'live' } ) );
						}
					} }
				/>
			) }
			{ isLearnMoreOpen && <AmplifyLearnMoreModal onClose={ () => setIsLearnMoreOpen( false ) } /> }
			{ isDevelopment && areDevSettingsReady && (
				<AmplifyDevStateControls settings={ devSettings } onChange={ setDevSettings } />
			) }
		</PageLayout>
	);
}

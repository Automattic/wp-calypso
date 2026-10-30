import { activeAgencyQuery, amplifyReportsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Tooltip,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { AgencyNotices } from '../components/agency-notices';
import { getFeatureName } from './constants';
import AmplifyLearnMoreModal from './learn-more-modal';
import AmplifyNewReportModal from './new-report-modal';
import AmplifyReportCreator from './report-creator';
import AmplifyReportsList from './reports';
import { canStartScan, getUsageStatus } from './usage';
import { AmplifyApprovalNotice, AmplifyUsageCard } from './usage-meter';
import './style.scss';

export default function AgencyAmplify() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const reportsQuery = useQuery( amplifyReportsQuery( agencyId ) );
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState( false );
	const [ isLearnMoreOpen, setIsLearnMoreOpen ] = useState( false );
	const [ notActivated, setNotActivated ] = useState( false );
	const reports = reportsQuery.data?.reports ?? [];
	let state: 'empty' | 'reports' | 'loading' | 'error' = 'empty';
	if ( agency === undefined || reportsQuery.isLoading ) {
		state = 'loading';
	} else if ( reportsQuery.isError && ! reportsQuery.data ) {
		state = 'error';
	} else if ( reports.length > 0 ) {
		state = 'reports';
	}
	const usage = reportsQuery.data?.usage;
	const tierId = agency?.tier?.id;
	const usageStatus = getUsageStatus( usage, {
		approvalStatus: agency?.approval_status,
		notActivated,
	} );
	const canScan = canStartScan( usageStatus );
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
						? __( 'You’ve used all your reports for this month.' )
						: __( 'Reports unlock once your account is activated.' )
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
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'amplify-approval',
							isEligible: usageStatus === 'pending' || usageStatus === 'rejected',
							notice: <AmplifyApprovalNotice agencyId={ agencyId } status={ usageStatus } />,
						},
					] }
				/>
			}
			header={
				<PageHeader
					title={ getFeatureName() }
					description={ __(
						'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fix.'
					) }
					actions={
						state !== 'empty' ? (
							<HStack spacing={ 2 } alignment="center" expanded={ false }>
								{ state === 'reports' && (
									<Button variant="tertiary" onClick={ openLearnMore }>
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
								tierId={ tierId }
								onUsageError={ handleUsageError }
							/>
						</EmptyState>
					</EmptyState.Wrapper>
				) }
				{ state === 'reports' && (
					<div className="dashboard-amplify-results">
						<AmplifyUsageCard
							agencyId={ agencyId }
							usage={ usage }
							status={ usageStatus }
							tierId={ tierId }
						/>
						<AmplifyReportsList agencyId={ agencyId } reports={ reports } />
					</div>
				) }
				{ state === 'loading' && (
					<AmplifyReportsList agencyId={ agencyId } reports={ [] } isLoading />
				) }
				{ state === 'error' && (
					<VStack
						className="dashboard-amplify-results__error"
						role="alert"
						spacing={ 4 }
						alignment="flex-start"
					>
						<Text>{ __( 'Unable to load reports. Please try again.' ) }</Text>
						<Button variant="secondary" onClick={ () => reportsQuery.refetch() }>
							{ __( 'Retry' ) }
						</Button>
					</VStack>
				) }
			</div>
			{ isNewReportOpen && (
				<AmplifyNewReportModal
					agencyId={ agencyId }
					canScan={ canScan }
					usage={ usage }
					usageStatus={ usageStatus }
					tierId={ tierId }
					onUsageError={ handleUsageError }
					onClose={ () => setIsNewReportOpen( false ) }
					onCreated={ () => setIsNewReportOpen( false ) }
				/>
			) }
			{ isLearnMoreOpen && <AmplifyLearnMoreModal onClose={ () => setIsLearnMoreOpen( false ) } /> }
		</PageLayout>
	);
}

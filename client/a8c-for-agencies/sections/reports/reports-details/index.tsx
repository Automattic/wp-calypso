import page from '@automattic/calypso-router';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemView, { createFeaturePreview } from 'calypso/layout/hosting-dashboard/item-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { A4A_REPORTS_BUILD_LINK } from '../constants';
import DeleteReportConfirmationDialog from '../delete-report-confirmation-dialog';
import useHandleReportDelete from '../hooks/use-handle-report-delete';
import useSendReportEmailMutation from '../hooks/use-send-report-email-mutation';
import ReportsMobileView from './mobile-view';
import Reports from './reports';
import type { SiteReports, Report } from '../types';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './style.scss';

interface Props {
	siteReports: SiteReports;
	closeSitePreviewPane: () => void;
}

const REPORTS_ID = 'reports';

export default function ReportsDetails( { siteReports, closeSitePreviewPane }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedReportTab, setSelectedReportTab ] = useState( REPORTS_ID );
	const [ reportToDelete, setReportToDelete ] = useState< Report | null >( null );

	const { handleDeleteReport, isPending: isDeletingReport } = useHandleReportDelete();

	const sendReportEmailMutation = useSendReportEmailMutation( {
		onMutate: () => {
			dispatch(
				infoNotice( translate( 'Sending report…' ), {
					id: 'send-report-email-progress',
				} )
			);
		},
		onSuccess: () => {
			dispatch(
				successNotice( translate( 'Report sent successfully!' ), {
					duration: 5000,
					id: 'send-report-email-success',
				} )
			);
		},
		onError: ( error ) => {
			dispatch(
				errorNotice( error?.message || translate( 'Failed to send report. Please try again.' ), {
					duration: 8000,
					id: 'send-report-email-error',
				} )
			);
		},
		onSettled: () => {
			// Remove the progress notice when the request completes (success or error)
			dispatch( {
				type: 'NOTICE_REMOVE',
				noticeId: 'send-report-email-progress',
			} );
		},
	} );

	const itemData: ItemData = {
		title: siteReports.site,
		subtitle: translate( 'Showing %s report', 'Showing %s reports', {
			count: siteReports.reports.length,
			args: [ siteReports.reports.length ],
		} ),
		withIcon: false,
		hideEnvDataInHeader: true,
	};

	const isDesktop = useDesktopBreakpoint();

	const actions = useMemo(
		() => [
			{
				id: 'duplicate-report',
				label: translate( 'Duplicate report' ),
				callback( items: Report[] ) {
					const report = items[ 0 ];
					dispatch( recordTracksEvent( 'calypso_a4a_reports_duplicate_report_button_click' ) );
					page.redirect( addQueryArgs( A4A_REPORTS_BUILD_LINK, { sourceId: report.id } ) );
				},
				isEligible( report: Report ) {
					return report.status !== 'error';
				},
			},
			{
				id: 'send-me-copy',
				label: translate( 'Send me a copy' ),
				callback( items: Report[] ) {
					const report = items[ 0 ];
					dispatch( recordTracksEvent( 'calypso_a4a_reports_send_me_copy_button_click' ) );
					sendReportEmailMutation.mutate( { reportId: report.id, preview: true } );
				},
				isEligible( report: Report ) {
					return [ 'processed', 'sent' ].includes( report.status );
				},
			},
			{
				id: 'send-to-client',
				label: translate( 'Send to client' ),
				callback( items: Report[] ) {
					const report = items[ 0 ];
					dispatch( recordTracksEvent( 'calypso_a4a_reports_send_to_client_button_click' ) );
					sendReportEmailMutation.mutate( { reportId: report.id } );
				},
				isEligible( report: Report ) {
					return [ 'processed', 'sent' ].includes( report.status );
				},
			},
			{
				id: 'delete-report',
				label: translate( 'Delete report' ),
				callback( items: Report[] ) {
					const report = items[ 0 ];
					dispatch( recordTracksEvent( 'calypso_a4a_reports_delete_report_button_click' ) );
					setReportToDelete( report );
				},
			},
		],
		[ dispatch, translate, sendReportEmailMutation ]
	);

	const features = useMemo(
		() => [
			createFeaturePreview(
				REPORTS_ID,
				translate( 'Reports' ),
				true,
				selectedReportTab,
				setSelectedReportTab,
				! isDesktop ? (
					<ReportsMobileView reports={ siteReports.reports } actions={ actions } />
				) : (
					<Reports reports={ siteReports.reports } actions={ actions } />
				)
			),
		],
		[ siteReports.reports, isDesktop, selectedReportTab, translate, actions ]
	);

	return (
		<>
			<ItemView
				className="reports-details-items"
				itemData={ itemData }
				closeItemView={ closeSitePreviewPane }
				features={ features }
				hideNavIfSingleTab
			/>
			{ reportToDelete && (
				<DeleteReportConfirmationDialog
					report={ reportToDelete }
					onClose={ () => setReportToDelete( null ) }
					onConfirm={ () => {
						dispatch( recordTracksEvent( 'calypso_a4a_reports_delete_report_confirm_click' ) );
						handleDeleteReport( reportToDelete, () => {
							setReportToDelete( null );
						} );
					} }
					isLoading={ isDeletingReport }
				/>
			) }
		</>
	);
}

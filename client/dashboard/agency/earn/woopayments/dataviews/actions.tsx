import { fetchAgencyWooPaymentsCommissionsReport } from '@automattic/api-core';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, download } from '@wordpress/icons';
import { useEffect } from 'react';
import { Text } from '../../../../components/text';
import { TextSkeleton } from '../../../../components/text-skeleton';
import type { RecordTracksEvent } from '../types';
import type { AgencyWooPaymentsReport, AgencyWooPaymentsSiteState } from '@automattic/api-core';
import type { Action, RenderModalProps } from '@wordpress/dataviews';

function downloadReportBlob( report: AgencyWooPaymentsReport ) {
	const blob = new Blob( [ report.data ], { type: 'text/csv;charset=utf-8;' } );
	const url = window.URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.download = report.filename;
	document.body.appendChild( link );
	link.click();
	document.body.removeChild( link );
	window.URL.revokeObjectURL( url );
}

function DownloadCommissionsReportModal( {
	items,
	closeModal,
	agencyId,
	recordTracksEvent,
}: RenderModalProps< AgencyWooPaymentsSiteState > & {
	agencyId: number;
	recordTracksEvent: RecordTracksEvent;
} ) {
	useEffect( () => {
		let isMounted = true;

		( async () => {
			try {
				const report = await fetchAgencyWooPaymentsCommissionsReport( agencyId, items[ 0 ].blogId );
				downloadReportBlob( report );
				recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report' );
			} catch {
				recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report_error' );
			} finally {
				if ( isMounted ) {
					closeModal?.();
				}
			}
		} )();

		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount, for the item selected when the modal opened
	}, [] );

	return (
		<VStack spacing={ 4 }>
			<Text>{ __( 'Your report is being prepared.' ) }</Text>
			<Text>{ __( 'The download will begin automatically.' ) }</Text>
			<TextSkeleton length={ 40 } />
		</VStack>
	);
}

export function getWooPaymentsActions( {
	agencyId,
	recordTracksEvent,
}: {
	agencyId: number;
	recordTracksEvent: RecordTracksEvent;
} ): Action< AgencyWooPaymentsSiteState >[] {
	return [
		{
			id: 'visit-wp-admin',
			label: __( 'Visit WP Admin' ),
			icon: external,
			supportsBulk: false,
			callback: ( items ) => {
				const site = items[ 0 ];
				const isInstalled = site.state === 'active';
				const url = isInstalled
					? `${ site.siteUrl }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`
					: `${ site.siteUrl }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term`;
				window.open( url, '_blank' );
				recordTracksEvent( 'calypso_a4a_woopayments_visit_wp_admin' );
			},
			isEligible: ( item ) => item.state !== 'disconnected',
		},
		{
			id: 'download-commissions-report',
			label: __( 'Download commissions report' ),
			icon: download,
			supportsBulk: false,
			modalHeader: __( 'Generating commissions report' ),
			callback: () => {},
			RenderModal: ( { items, closeModal } ) => (
				<DownloadCommissionsReportModal
					items={ items }
					closeModal={ closeModal }
					agencyId={ agencyId }
					recordTracksEvent={ recordTracksEvent }
				/>
			),
			isEligible: ( item ) => item.state === 'active',
		},
	];
}

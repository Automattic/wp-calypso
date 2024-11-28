import guessTimezone from '@automattic/i18n-utils/src/guess-timezone';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { CampaignReportRequestBody } from 'calypso/data/promote-post/types';
import useCampaignReportDataQuery from 'calypso/data/promote-post/use-promote-post-campaign-report-data-query';
import useCampaignReportStatusQuery from 'calypso/data/promote-post/use-promote-post-campaign-report-status-query';
import { CampaignResponse } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import useRequestCampaignReportMutation from 'calypso/data/promote-post/use-promote-post-request-campaign-report-mutation';
import { cvsStatsDownload } from 'calypso/my-sites/promote-post-i2/utils';

interface Props {
	siteId: number;
	campaign: CampaignResponse;
	isLoading?: boolean;
	setStatsError: () => void;
}

const FlexibleSkeleton = () => {
	return <div className="campaign-item-details__flexible-skeleton" />;
};

export default function CampaignDownloadStats( props: Props ) {
	const { campaign, isLoading, siteId, setStatsError } = props;
	const campaignId = campaign?.campaign_id;
	const translate = useTranslate();

	const defaultDownloadOptions: CampaignReportRequestBody = {
		start_date: campaign?.start_date || '',
		end_date: campaign?.end_date || '',
		tz: guessTimezone() || moment.tz.guess(),
	};

	const [ downloadOptions, setDownloadOptions ] =
		useState< CampaignReportRequestBody >( defaultDownloadOptions );
	const [ isStatsDownloading, setIsStatsDownloading ] = useState< boolean >( false );

	const [ reportId, setReportId ] = useState( '' );
	const [ shouldFetchReportStatus, setShouldFetchReportStatus ] = useState( false );
	const [ shouldFetchReportData, setShouldFetchReportData ] = useState( false );
	const [ reportFilename, setReportFilename ] = useState( '' );

	// 1 RequestCampaignReport
	const { requestCampaignReport } = useRequestCampaignReportMutation( () => {
		setStatsError();
		setIsStatsDownloading( false );
	} );

	// 2 GetCampaignReportStatus
	const { data: reportStatus } = useCampaignReportStatusQuery(
		siteId,
		campaignId,
		reportId,
		shouldFetchReportStatus,
		{
			enabled: shouldFetchReportStatus,
		}
	);

	// 3 GetCampaignReport
	const { data: reportData } = useCampaignReportDataQuery(
		siteId,
		campaignId,
		reportId,
		shouldFetchReportData,
		{
			enabled: shouldFetchReportData,
		}
	);

	useEffect( () => {
		if ( ! campaign?.start_date || ! campaign?.end_date ) {
			return;
		}

		const startDate = moment( campaign.start_date ).format( 'YYYY-MM-DD' ).toString();
		let endDate = moment( campaign.end_date ).format( 'YYYY-MM-DD' ).toString();

		if ( endDate < startDate ) {
			endDate = moment().format( 'YYYY-MM-DD' ).toString();
		}
		setDownloadOptions( ( prev ) => ( {
			...prev,
			start_date: startDate,
			end_date: endDate,
		} ) );
		setReportFilename( `blaze_report_${ startDate }_${ endDate }.csv` );
	}, [ campaign ] );

	const downloadStatsInit = async () => {
		// gets triggered when the download data button is clicked
		if ( ! siteId || ! campaignId ) {
			setStatsError();
			return;
		}
		setIsStatsDownloading( true );
		try {
			// call to DSP RequestCampaignReport
			const result = await requestCampaignReport( siteId, campaignId, downloadOptions );
			if ( result?.report_id ) {
				setReportId( result.report_id ); // Save the report ID for fetching status
				setShouldFetchReportStatus( true );
			} else {
				setStatsError();
				setIsStatsDownloading( false );
			}
		} catch {
			setStatsError();
			setIsStatsDownloading( false );
		}
	};

	useEffect( () => {
		// Effect triggered when `reportStatus` updates
		let timer: number | NodeJS.Timeout;
		if ( reportStatus ) {
			setShouldFetchReportStatus( false );
			if ( reportStatus.status === 'completed' ) {
				// Trigger fetching the report data object when completed
				setShouldFetchReportData( true );
			} else if ( reportStatus.status === 'failed' ) {
				setStatsError();
				setIsStatsDownloading( false );
			} else if ( [ 'active', 'waiting', 'delayed' ].includes( reportStatus.status ) ) {
				// will retrigger the status fetch after 1.2 sec
				timer = setTimeout( () => setShouldFetchReportStatus( true ), 1200 );
			}
		}
		return () => clearTimeout( timer ); // Cleanup timer on unmount
	}, [ reportStatus ] );

	useEffect( () => {
		// Effect triggered when `reportData` updates
		if ( reportData ) {
			setIsStatsDownloading( false );
			setShouldFetchReportData( false );
			cvsStatsDownload( reportData, reportFilename );
		}
	}, [ reportData ] );

	useEffect( () => {
		// Reset state when the user clicks the button again
		if ( ! isStatsDownloading && reportId ) {
			setReportId( '' );
			setShouldFetchReportStatus( false );
			setShouldFetchReportData( false );
		}
	}, [ isStatsDownloading ] );

	return (
		<>
			{ ! isLoading ? (
				<>
					{ isStatsDownloading ? (
						<div className="stats-downloading">
							<Spinner />
							<span>{ translate( 'Generating report' ) }</span>
						</div>
					) : (
						<Button
							variant="secondary"
							className="campaign-item-details__stats-button"
							onClick={ () => {
								downloadStatsInit();
							} }
						>
							{ translate( 'Download data' ) }
						</Button>
					) }
				</>
			) : (
				<FlexibleSkeleton />
			) }
		</>
	);
}

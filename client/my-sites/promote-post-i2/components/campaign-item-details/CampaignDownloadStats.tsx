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
	siteId?: number;
	campaign?: CampaignResponse;
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
		tz: moment.tz.guess(),
	};

	const [ downloadOptions, setDownloadOptions ] =
		useState< CampaignReportRequestBody >( defaultDownloadOptions );
	const [ isStatsDownloading, setIsStatsDownloading ] = useState< boolean >( false );

	const [ reportId, setReportId ] = useState( '' );
	const [ shouldFetchReportStatus, setShouldFetchReportStatus ] = useState( false );
	const [ shouldFetchReportData, setShouldFetchReportData ] = useState( false );

	const { data: reportStatus } = useCampaignReportStatusQuery(
		siteId,
		campaignId,
		reportId,
		shouldFetchReportStatus,
		{
			enabled: shouldFetchReportStatus,
		}
	);

	const { data: reportData } = useCampaignReportDataQuery(
		siteId,
		campaignId,
		reportId,
		shouldFetchReportData,
		{
			enabled: shouldFetchReportData,
		}
	);

	const { requestCampaignReport } = useRequestCampaignReportMutation( () => {
		setStatsError();
		setIsStatsDownloading( false );
	} );

	const downloadStatsInit = async () => {
		if ( ! siteId || ! campaignId ) {
			setStatsError();
			return;
		}
		setIsStatsDownloading( true );
		try {
			const result = await requestCampaignReport( siteId, campaignId, downloadOptions );
			if ( ! result?.report_id ) {
				setStatsError();
			}
			if ( result.report_id ) {
				setReportId( result.report_id );
				setShouldFetchReportStatus( true );
				return;
			}
			setStatsError();
			setIsStatsDownloading( false );
		} catch {
			setStatsError();
			setIsStatsDownloading( false );
		}
	};

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
	}, [ campaign ] );

	useEffect( () => {
		let timer: number | NodeJS.Timeout;
		if ( reportStatus ) {
			setShouldFetchReportStatus( false );
			if ( reportStatus.status === 'completed' ) {
				setShouldFetchReportData( true );
			} else if ( reportStatus.status === 'failed' ) {
				setStatsError();
			} else if ( [ 'active', 'waiting', 'delayed' ].includes( reportStatus.status ) ) {
				timer = setTimeout( () => setShouldFetchReportStatus( true ), 1200 );
			}
		}
		return () => clearTimeout( timer ); // Cleanup timer on unmount
	}, [ reportStatus, shouldFetchReportStatus, setStatsError, setShouldFetchReportData ] );

	useEffect( () => {
		if ( reportData ) {
			setIsStatsDownloading( false );
			setShouldFetchReportData( false );
			if ( reportData.fileName && reportData.content ) {
				cvsStatsDownload( reportData.content, reportData.fileName );
			}
		}
	}, [ reportData, setIsStatsDownloading, setShouldFetchReportData ] );

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

import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import useFetchReportById from './use-fetch-report-by-id';
import type {
	BuildReportFormData,
	BuildReportCheckedItemsState,
	ReportFormAPIResponse,
} from '../types';
import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

interface UseDuplicateReportFormDataReturn {
	formData: BuildReportFormData;
	setSelectedTimeframe: ( value: string ) => void;
	setSelectedSite: ( site: A4ASelectSiteItem | null ) => void;
	setClientEmail: ( value: string ) => void;
	setCustomIntroText: ( value: string ) => void;
	setSendCopyToTeam: ( value: boolean ) => void;
	setTeammateEmails: ( value: string ) => void;
	setStartDate: ( value: string | undefined ) => void;
	setEndDate: ( value: string | undefined ) => void;
	setStatsCheckedItems: ( value: BuildReportCheckedItemsState ) => void;
	isLoading: boolean;
	isDuplicating: boolean;
	error: Error | null;
}

export const useDuplicateReportFormData = (
	availableTimeframes: { label: string; value: string }[],
	statsOptions: { label: string; value: string }[]
): UseDuplicateReportFormDataReturn => {
	const translate = useTranslate();
	const sites = useSelector( getSites );

	// Get sourceId from URL parameters
	const sourceId = getQueryArg( window.location.href, 'sourceId' ) as unknown as number;
	const isDuplicating = Boolean( sourceId );

	const {
		data: reportDetails,
		isLoading,
		error,
	} = useFetchReportById( isDuplicating ? sourceId : null );

	// Initialize default values
	const today = new Date();
	const yesterday = new Date( today );
	yesterday.setDate( today.getDate() - 1 );

	// Form state
	const [ selectedTimeframe, setSelectedTimeframe ] = useState(
		availableTimeframes[ 0 ]?.value || '30_days'
	);
	const [ selectedSite, setSelectedSite ] = useState< A4ASelectSiteItem | null >( null );
	const [ clientEmail, setClientEmail ] = useState( '' );
	const [ customIntroText, setCustomIntroText ] = useState( '' );
	const [ sendCopyToTeam, setSendCopyToTeam ] = useState( false );
	const [ teammateEmails, setTeammateEmails ] = useState( '' );
	const [ startDate, setStartDate ] = useState< string | undefined >(
		yesterday.toISOString().split( 'T' )[ 0 ]
	);
	const [ endDate, setEndDate ] = useState< string | undefined >(
		today.toISOString().split( 'T' )[ 0 ]
	);
	const [ statsCheckedItems, setStatsCheckedItems ] = useState< BuildReportCheckedItemsState >(
		statsOptions.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);

	const findSiteById = useCallback(
		( reportData: ReportFormAPIResponse ): A4ASelectSiteItem | null => {
			const foundSite = sites.find( ( site ) => site?.ID === reportData.blog_id );
			if ( foundSite ) {
				return {
					blogId: foundSite.ID,
					domain: foundSite.domain,
					managedSiteId: reportData.managed_site_id,
				};
			}
			return null;
		},
		[ sites ]
	);

	const reportData = reportDetails?.data;

	// Populate form data when report data is fetched
	useEffect( () => {
		if ( ! reportData || ! sites.length ) {
			return;
		}

		const site = findSiteById( reportData );
		setSelectedSite( site );
		setSelectedTimeframe( reportData.timeframe );
		setClientEmail( reportData.client_emails?.join( ', ' ) || '' );
		setCustomIntroText( reportData.custom_intro_text );
		setSendCopyToTeam( reportData.send_copy_to_team );
		setTeammateEmails( reportData.teammate_emails?.join( ', ' ) || '' );
		setStartDate( reportData.start_date );
		setEndDate( reportData.end_date );
		setStatsCheckedItems( reportData.stats_items );
	}, [ reportData, sites, findSiteById, translate ] );

	const formData: BuildReportFormData = {
		selectedSite,
		selectedTimeframe,
		clientEmail,
		startDate,
		endDate,
		sendCopyToTeam,
		teammateEmails,
		customIntroText,
		statsCheckedItems,
	};

	return {
		formData,
		setSelectedTimeframe,
		setSelectedSite,
		setClientEmail,
		setCustomIntroText,
		setSendCopyToTeam,
		setTeammateEmails,
		setStartDate,
		setEndDate,
		setStatsCheckedItems,
		isLoading,
		isDuplicating,
		error,
	};
};

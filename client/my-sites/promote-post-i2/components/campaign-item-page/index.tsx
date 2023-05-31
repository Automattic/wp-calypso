import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useCampaignsQueryNew from 'calypso/data/promote-post/use-promote-post-campaigns-query-new';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	formatNumber,
	formatCents,
	getCampaignDurationFormatted,
	getCampaignEstimatedImpressions,
} from '../../utils';
import CampaignItemDetails from '../campaign-item-details';

interface Props {
	campaignId: number;
}

export default function CampaignItemPage() {
	// const { campaignId } = props;
	const campaignId = 5901;

	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const campaignQuery = useCampaignsQueryNew( siteId || 0, campaignId );

	const { isLoading: campaignsIsLoading, isError } = campaignQuery;
	const { data: campaign } = campaignQuery;

	useEffect( () => {
		document.querySelector( 'body' )?.classList.add( 'is-section-promote-post-i2' );
	}, [] );

	if ( isError ) {
		return <CampaignItemDetails isLoading={ true } />;
	}

	if ( ! campaign ) {
		return <CampaignItemDetails isLoading={ true } />;
	}

	const {
		audience_list,
		content_config,
		start_date,
		end_date,
		display_name,
		impressions_total,
		clicks_total,
		clickthrough_rate,
		duration_days,
		total_budget_left,
		overall_spending,
		display_delivery_estimate,
		delivery_percent,
		visits_organic,
		visits_organic_rate,
		visits_ad_rate,
		creative_html,
		width,
		height,
	} = campaign;

	const { title } = content_config;

	// Target block
	const devicesList = audience_list[ 'devices' ] || '';
	const countriesList = audience_list[ 'countries' ] || '';
	const topicsList = audience_list[ 'topics' ] || '';
	const OSsList = audience_list[ 'OSs' ] || '';

	// Formatted labels
	const ctrFormatted = clickthrough_rate ? `${ clickthrough_rate.toFixed( 2 ) }%` : '-';
	const durationFormatted = getCampaignDurationFormatted( start_date, end_date );
	const totalBudgetLeftFormatted = `$${ formatCents( total_budget_left || 0 ) } ${ __( 'left' ) }`;
	const overallSpendingFormatted = `$${ formatCents( overall_spending || 0 ) }`;
	const deliveryEstimateFormatted = getCampaignEstimatedImpressions( display_delivery_estimate );
	const campaignTitleFormatted = title || __( 'Untitled' );
	const campaignCreatedFormatted = moment.utc( start_date ).format( 'MMMM DD, YYYY' );

	const devicesListFormatted = devicesList ? `${ devicesList }` : '-';
	const countriesListFormatted = countriesList ? `${ countriesList }` : '-';
	const osListFormatted = OSsList ? `${ OSsList }` : translate( 'All' );
	const topicsListFormatted = topicsList ? `${ topicsList }` : '-';
	const clickUrl = content_config.clickUrl;

	const impressionsTotal = formatNumber( impressions_total );
	const clicksTotal = formatNumber( clicks_total );
	const visitsOrganic = formatNumber( visits_organic );

	if ( campaignsIsLoading ) {
		return null;
	}

	return (
		<CampaignItemDetails
			campaignId={ campaignId }
			campaignTitleFormatted={ campaignTitleFormatted }
			campaignCreatedFormatted={ campaignCreatedFormatted }
			displayName={ display_name }
			impressionsTotal={ impressionsTotal }
			clicksTotal={ clicksTotal }
			ctrFormatted={ ctrFormatted }
			durationFormatted={ durationFormatted }
			durationDays={ duration_days }
			totalBudgetLeft={ total_budget_left }
			totalBudgetLeftFormatted={ totalBudgetLeftFormatted }
			overallSpendingFormatted={ overallSpendingFormatted }
			deliveryEstimateFormatted={ deliveryEstimateFormatted }
			deliveryPercent={ delivery_percent }
			visitsAdRate={ visits_ad_rate }
			visitsOrganicRate={ visits_organic_rate }
			visitsOrganic={ visitsOrganic }
			devicesListFormatted={ devicesListFormatted }
			countriesListFormatted={ countriesListFormatted }
			osListFormatted={ osListFormatted }
			topicsListFormatted={ topicsListFormatted }
			clickUrl={ clickUrl }
			width={ width }
			height={ height }
			creativeHtml={ creative_html }
		/>
	);
}

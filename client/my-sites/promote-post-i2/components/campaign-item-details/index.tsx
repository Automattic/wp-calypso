import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import './style.scss';
import { Badge, Button, Dialog } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button as WPButton } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment/moment';
import { useState } from 'react';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import useBillingSummaryQuery from 'calypso/data/promote-post/use-promote-post-billing-summary-query';
import {
	CampaignResponse,
	Order,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import useCancelCampaignMutation from 'calypso/data/promote-post/use-promote-post-cancel-campaign-mutation';
import usePromotePostCampaignsStatsQuery from 'calypso/data/promote-post/use-promote-posts-campaigns-objectives-query';
import AdPreview from 'calypso/my-sites/promote-post-i2/components/ad-preview';
import AdPreviewModal from 'calypso/my-sites/promote-post-i2/components/campaign-item-details/AdPreviewModal';
import useOpenPromoteWidget from 'calypso/my-sites/promote-post-i2/hooks/use-open-promote-widget';
import {
	canCancelCampaign,
	formatAmount,
	getAdvertisingDashboardPath,
	getCampaignActiveDays,
	getCampaignDurationFormatted,
} from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useIsRunningInWpAdmin from '../../hooks/use-is-running-in-wpadmin';
import {
	formatCents,
	formatNumber,
	getCampaignEstimatedImpressions,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
} from '../../utils';
import TargetLocations from './target-locations';

interface Props {
	isLoading?: boolean;
	siteId?: number;
	campaign?: CampaignResponse;
}

const FlexibleSkeleton = () => {
	return <div className="campaign-item-details__flexible-skeleton" />;
};

const getPostIdFromURN = ( targetUrn: string ) => {
	if ( ! targetUrn.includes( ':' ) ) {
		return;
	}

	const splitted = targetUrn.split( ':' );
	if ( splitted.length >= 4 ) {
		return splitted[ 4 ];
	}
};

const getExternalLinkIcon = ( fillColor?: string ) => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.93271 3.02436L12.4162 3.01314L8.1546 7.27477L8.8617 7.98188L13.1183 3.72526L13.0971 6.18673L14.0971 6.19534L14.1332 2.00537L9.92819 2.02437L9.93271 3.02436ZM4.66732 2.83349C3.6548 2.83349 2.83398 3.6543 2.83398 4.66682V11.3335C2.83398 12.346 3.6548 13.1668 4.66732 13.1668H11.334C12.3465 13.1668 13.1673 12.346 13.1673 11.3335V8.90756H12.1673V11.3335C12.1673 11.7937 11.7942 12.1668 11.334 12.1668H4.66732C4.20708 12.1668 3.83398 11.7937 3.83398 11.3335V4.66682C3.83398 4.20658 4.20708 3.83349 4.66732 3.83349H6.83398V2.83349H4.66732Z"
			fill={ fillColor }
		/>
	</svg>
);

const getExternalTabletIcon = ( fillColor = '#A7AAAD' ) => (
	<span className="campaign-item-details__tablet-icon">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14 16L10 16V17.5H14V16Z" fill={ fillColor } />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5 6C5 4.89543 5.89543 4 7 4L17 4C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18L5 6ZM7 5.5L17 5.5C17.2761 5.5 17.5 5.72386 17.5 6V18C17.5 18.2761 17.2761 18.5 17 18.5H7C6.72386 18.5 6.5 18.2761 6.5 18L6.5 6C6.5 5.72386 6.72386 5.5 7 5.5Z"
				fill={ fillColor }
			/>
		</svg>
	</span>
);

const trafficIcon = () => (
	<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M25 16.955C25 15.2168 27.1241 14.3463 28.3664 15.5754L47.4224 34.4277C48.1925 35.1897 48.1925 36.4251 47.4224 37.187L28.3664 56.4246C27.1241 57.6538 25 56.7832 25 55.045V16.955Z"
			fill="#212121"
		/>
		<path
			d="M52 24.8228C52 23.2021 54.1162 22.3905 55.3538 23.5365L67.4246 34.7136C68.1918 35.4241 68.1918 36.5759 67.4246 37.2864L55.3538 48.4635C54.1162 49.6095 52 48.7979 52 47.1772V24.8228Z"
			fill="#A3B4FF"
		/>
		<path
			d="M5 24.8228C5 23.2021 7.11618 22.3905 8.35382 23.5365L20.4246 34.7136C21.1918 35.4241 21.1918 36.5759 20.4246 37.2864L8.35383 48.4635C7.11618 49.6095 5 48.7979 5 47.1772V24.8228Z"
			fill="#BEBEBE"
		/>
	</svg>
);

const salesIcon = () => (
	<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M33.916 13.0445C32.7499 14.5553 32.0556 16.4479 32.0556 18.4997V19.0556H29.5V18.4997C29.5 16.213 30.1712 14.0797 31.3269 12.2868C32.2633 12.3379 33.1431 12.6072 33.916 13.0445Z"
			fill="#BEBEBE"
		/>
		<path
			d="M36.2049 10.9519C36.6681 10.6566 37.1601 10.4028 37.6758 10.1956C38.0242 10.0557 38.3833 9.93707 38.7516 9.84138C38.0041 9.12921 37.1641 8.51657 36.2494 8.02757C36.1338 8.08023 36.0192 8.13476 35.9056 8.19111C35.0896 8.59607 34.3281 9.09513 33.6356 9.67402C34.5655 9.96129 35.4312 10.3965 36.2049 10.9519Z"
			fill="#BEBEBE"
		/>
		<path
			d="M56.2247 65.7775H61.4444C62.8564 65.7775 64 64.6339 64 63.222V24.8886C64 23.4767 62.8564 22.3331 61.4444 22.3331H56.5131C56.826 23.0282 57 23.7993 57 24.6112V62.9445C57 63.9794 56.7172 64.9481 56.2247 65.7775Z"
			fill="#BEBEBE"
		/>
		<path
			d="M52.5 22.2829V22.3331H52.6041C53.4328 22.7555 54 23.6168 54 24.6112V62.9445C54 64.3565 52.8564 65.5001 51.4444 65.5001H19.3959C18.5672 65.0776 18 64.2163 18 63.222V24.8886C18 23.4767 19.1436 22.3331 20.5556 22.3331H29.5V22.0556H32.0556V22.3331H49.9444V22.0556H51.4444C51.8209 22.0556 52.1783 22.1369 52.5 22.2829Z"
			fill="#BEBEBE"
		/>
		<path
			d="M52.5 19.1557V18.9061C52.5 12.7868 47.8936 7.43545 41.7884 7.02656C41.2212 6.98846 40.6619 6.99177 40.1133 7.03378C41.0458 7.81549 41.8781 8.71205 42.5933 9.69738C46.768 10.4509 49.9444 14.1112 49.9444 18.4997V19.0556H51.4444C51.8054 19.0556 52.1583 19.09 52.5 19.1557Z"
			fill="#BEBEBE"
		/>
		<path
			d="M51.4444 22.0557H42.5V18.6287C42.5 12.5094 37.8936 7.1581 31.7884 6.74922C25.0928 6.29944 19.5 11.6214 19.5 18.2224V22.0557H10.5556C9.14361 22.0557 8 23.1993 8 24.6113V62.9446C8 64.3566 9.14361 65.5002 10.5556 65.5002H51.4444C52.8564 65.5002 54 64.3566 54 62.9446V24.6113C54 23.1993 52.8564 22.0557 51.4444 22.0557ZM22.0556 18.2224C22.0556 13.2902 26.0678 9.27794 31 9.27794C35.9322 9.27794 39.9444 13.2902 39.9444 18.2224V22.0557H22.0556V18.2224Z"
			fill="#A3B4FF"
		/>
		<circle cx="31.5" cy="44.5" r="9.5" fill="#212121" stroke="#A3B4FF" strokeWidth="4" />
	</svg>
);

const awarenessIcon = () => (
	<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_160_1379)">
			<path
				d="M45.875 7.37492L45.875 12.9583"
				stroke="#BEBEBE"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M58.4375 11.5625L54.25 15.75"
				stroke="#BEBEBE"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M62.625 24.125L57.0417 24.125"
				stroke="#BEBEBE"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M58.0521 36.4979L52.92 31.3658C52.3131 30.7589 51.4899 30.4179 50.6316 30.4179C49.7733 30.4179 48.9501 30.7589 48.3432 31.3658L34.4502 45.2588C33.8127 45.8963 33.0558 46.402 32.2229 46.747C31.39 47.092 30.4973 47.2696 29.5957 47.2696C28.6941 47.2696 27.8014 47.092 26.9685 46.747C26.1355 46.402 25.3787 45.8963 24.7412 45.2588C24.1037 44.6213 23.598 43.8645 23.253 43.0316C22.908 42.1986 22.7304 41.3059 22.7304 40.4044C22.7304 39.5028 22.908 38.6101 23.253 37.7771C23.598 36.9442 24.1037 36.1874 24.7412 35.5499L38.6344 21.6568C39.2413 21.0499 39.5823 20.2267 39.5823 19.3684C39.5823 18.5101 39.2413 17.6869 38.6344 17.08L33.5023 11.9479C32.8954 11.341 32.0722 11 31.2139 11C30.3555 11 29.5324 11.341 28.9255 11.9479L15.0323 25.841C11.1699 29.7035 9 34.942 9 40.4044C9 45.8667 11.1699 51.1053 15.0323 54.9677C18.8948 58.8301 24.1334 61 29.5957 61C35.058 61 40.2966 58.8301 44.1591 54.9677L58.0522 41.0746C58.6591 40.4677 59 39.6445 59 38.7862C59 37.9279 58.659 37.1048 58.0521 36.4979Z"
				fill="#A3B4FF"
			/>
			<path
				d="M60.6951 36.0205L60.6938 36.0193L53.0132 28.3373L53.0131 28.3372C52.477 27.8011 51.7521 27.5 50.9924 27.5C50.2358 27.5 49.5079 27.799 48.9705 28.3384C48.9699 28.3389 48.9694 28.3395 48.9688 28.3401L40.9393 36.3695L39.8787 37.4302L40.9393 38.4909L50.5415 48.093L51.6021 49.1536L52.6628 48.093L60.6937 40.062L60.6951 40.0607C61.8087 38.9442 61.8087 37.137 60.6951 36.0205Z"
				fill="#212121"
				stroke="#F5F5F5"
				strokeWidth="3"
			/>
			<path
				d="M41.6654 17.006L41.6642 17.0047L33.9964 9.33654L33.9964 9.33645C33.4606 8.8008 32.7363 8.5 31.9773 8.5C31.2213 8.5 30.494 8.7987 29.957 9.33765C29.9565 9.33819 29.9559 9.33874 29.9554 9.33928L21.9394 17.3544L20.8786 18.4151L21.9394 19.4758L31.5254 29.0607L32.586 30.1212L33.6466 29.0607L41.6641 21.0442L41.6654 21.0428C42.7782 19.9273 42.7782 18.1215 41.6654 17.006Z"
				fill="#212121"
				stroke="#F5F5F5"
				strokeWidth="3"
			/>
		</g>
		<defs>
			<clipPath id="clip0_160_1379">
				<rect width="72" height="72" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const engagementIcon = () => (
	<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M18.5625 47.625C22.3077 47.625 25.3438 44.5889 25.3438 40.8438C25.3438 37.0986 22.3077 34.0625 18.5625 34.0625C14.8173 34.0625 11.7812 37.0986 11.7812 40.8438C11.7812 44.5889 14.8173 47.625 18.5625 47.625Z"
			fill="#BEBEBE"
		/>
		<path
			d="M18.5625 51.5C11.0857 51.5 5 57.5838 5 65.0625C5 66.132 5.86606 67 6.9375 67H30.1875C31.2589 67 32.125 66.132 32.125 65.0625C32.125 57.5838 26.0393 51.5 18.5625 51.5Z"
			fill="#212121"
		/>
		<path
			d="M53.4375 47.625C57.1827 47.625 60.2188 44.5889 60.2188 40.8438C60.2188 37.0986 57.1827 34.0625 53.4375 34.0625C49.6923 34.0625 46.6562 37.0986 46.6562 40.8438C46.6562 44.5889 49.6923 47.625 53.4375 47.625Z"
			fill="#212121"
		/>
		<path
			d="M53.4375 51.5C45.9607 51.5 39.875 57.5838 39.875 65.0625C39.875 66.132 40.7411 67 41.8125 67H65.0625C66.1339 67 67 66.132 67 65.0625C67 57.5838 60.9143 51.5 53.4375 51.5Z"
			fill="#BEBEBE"
		/>
		<path
			d="M62.1562 5H35.0312C32.3594 5 30.1875 7.17387 30.1875 9.84375V34.0625C30.1875 34.8065 30.6157 35.4866 31.2841 35.8082C31.5534 35.9361 31.8383 36 32.125 36C32.5571 36 32.9852 35.8547 33.3359 35.5757L42.4926 28.25H62.1562C64.8281 28.25 67 26.0761 67 23.4062V9.84375C67 7.17387 64.8281 5 62.1562 5Z"
			fill="#A3B4FF"
		/>
	</svg>
);

export default function CampaignItemDetails( props: Props ) {
	const isRunningInWpAdmin = useIsRunningInWpAdmin();
	const translate = useTranslate();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ showErrorDialog, setShowErrorDialog ] = useState( false );
	const { cancelCampaign } = useCancelCampaignMutation( () => setShowErrorDialog( true ) );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const { campaign, isLoading, siteId } = props;
	const campaignId = campaign?.campaign_id;
	const isWooStore = config.isEnabled( 'is_running_in_woo_site' );
	const { data, isLoading: isLoadingBillingSummary } = useBillingSummaryQuery();
	const paymentBlocked = data?.paymentsBlocked ?? false;
	const { data: campaignObjectives, isLoading: campaignObjectivesIsLoading } =
		usePromotePostCampaignsStatsQuery( siteId ?? 0 );

	const {
		audience_list,
		content_config,
		start_date,
		end_date,
		display_name,
		creative_html,
		width,
		height,
		status,
		ui_status,
		campaign_stats,
		objective,
		billing_data,
		display_delivery_estimate = '',
		target_urn,
		campaign_id,
		created_at,
		format,
		budget_cents,
		type,
		is_evergreen = false,
	} = campaign || {};

	const {
		impressions_total = 0,
		clicks_total,
		clickthrough_rate,
		duration_days,
		total_budget,
		total_budget_used,
		conversions_total,
		conversion_value,
		conversion_rate,
		conversion_last_currency_found,
	} = campaign_stats || {};

	const { card_name, payment_method, credits, total, orders, payment_links } = billing_data || {};
	const { title, clickUrl } = content_config || {};
	const canDisplayPaymentSection =
		orders && orders.length > 0 && ( payment_method || ! isNaN( total || 0 ) );

	const onClickPromote = useOpenPromoteWidget( {
		keyValue: `post-${ getPostIdFromURN( target_urn || '' ) }_campaign-${ campaign_id }`,
		entrypoint: 'promoted_posts-campaign-details-header',
	} );

	// Target block
	const {
		devices: devicesList,
		topics: topicsList,
		languages: languagesList,
	} = audience_list || {};

	// Formatted labels
	const cpcFormatted =
		total_budget_used && clicks_total && clicks_total > 0
			? `$${ formatCents( total_budget_used / clicks_total, 2 ) }`
			: '-';
	const ctrFormatted = clickthrough_rate ? `${ clickthrough_rate.toFixed( 2 ) }%` : '-';
	const clicksFormatted = clicks_total && clicks_total > 0 ? formatNumber( clicks_total ) : '-';
	const weeklyBudget = budget_cents ? ( budget_cents / 100 ) * 7 : 0;

	const weeklyBudgetFormatted = `$${ formatCents( weeklyBudget || 0, 2 ) }`;
	const weeklySpend =
		total_budget_used && billing_data ? Math.max( 0, total_budget_used - billing_data?.total ) : 0;

	const weeklySpendFormatted = `$${ formatCents( weeklySpend, 2 ) }`;

	const weeklySpendingPercentage =
		total_budget_used && total_budget
			? `${ ( ( weeklySpend / weeklyBudget ) * 100 ).toFixed( 0 ) }%`
			: '0%';
	const weeklySpendingPercentageFormatted = weeklySpendingPercentage
		? /* translators: overallSpendingPercentage is the percentage of the total budget used */
		  translate( '%(weeklySpendingPercentage)s of weekly budget', {
				args: { weeklySpendingPercentage },
		  } )
		: '';

	const displayBudget = is_evergreen ? weeklyBudget : total_budget;
	const totalBudgetFormatted = `$${ formatCents( displayBudget || 0, 2 ) }`;

	const deliveryEstimateFormatted = getCampaignEstimatedImpressions( display_delivery_estimate );
	const campaignTitleFormatted = title || __( 'Untitled' );
	const campaignCreatedFormatted = moment.utc( created_at ).format( 'MMMM DD, YYYY' );

	const getObjectiveDetailsById = ( id: string ) => {
		if ( Array.isArray( campaignObjectives ) && campaignObjectives.length > 0 ) {
			const objective = campaignObjectives.find( ( obj ) => obj.id === id );
			if ( objective ) {
				return {
					title: objective.title,
					description: objective.description,
				};
			}
		}
		// Return null or handle the case when the array is not present or no match is found
		return {
			title: translate( 'Traffic' ),
			description: translate( 'Aims to drive more visitors and increase page views.' ),
		};
	};

	const objectiveFormatted = ( () => {
		const objectiveDetails = getObjectiveDetailsById( objective ?? '' );
		const icon = ( () => {
			switch ( objective ) {
				case 'traffic':
					return <span> { trafficIcon() } </span>;
				case 'sales':
					return <span> { salesIcon() } </span>;
				case 'awareness':
					return <span> { awarenessIcon() } </span>;
				case 'engagement':
					return <span> { engagementIcon() } </span>;
				default: // if no objective is found we default to traffic
					return <span> { trafficIcon() } </span>;
			}
		} )();

		return (
			<>
				<span> { icon } </span>
				<span>
					<span className="title">{ objectiveDetails.title }</span>
					{ ' - ' }
					{ objectiveDetails.description }
				</span>
			</>
		);
	} )();
	const devicesListFormatted = devicesList ? `${ devicesList }` : __( 'All' );
	const durationDateFormatted = getCampaignDurationFormatted(
		start_date,
		end_date,
		is_evergreen,
		campaign?.ui_status
	);
	const languagesListFormatted = languagesList
		? `${ languagesList }`
		: translate( 'All languages' );
	const topicsListFormatted = topicsList ? `${ topicsList }` : __( 'All' );
	const impressionsTotal = formatNumber( impressions_total );
	const creditsFormatted = `$${ formatCents( credits || 0 ) }`;
	const totalFormatted = `$${ formatCents( total || 0, 2 ) }`;
	const dailyAverageSpending = budget_cents ? `${ ( budget_cents / 100 ).toFixed( 2 ) }` : '';
	const dailyAverageSpendingFormatted = `$${ dailyAverageSpending }`;
	const conversionsTotalFormatted = conversions_total ? conversions_total : '-';
	const conversionValueFormatted =
		conversion_last_currency_found && conversion_value
			? formatAmount(
					conversion_value[ conversion_last_currency_found ],
					conversion_last_currency_found
			  )
			: '-';
	const conversionsRateFormatted = conversion_rate
		? `${ ( conversion_rate * 100 ).toFixed( 2 ) }%`
		: '-';

	const activeDays = getCampaignActiveDays( start_date, end_date );

	// Since we don't know the end of the campaign, for evergreen we show total so far
	const durationDays = is_evergreen ? activeDays : duration_days;
	const durationFormatted = durationDays
		? sprintf(
				/* translators: %s is the duration in days */
				_n( '%s day', '%s days', durationDays ),
				formatNumber( durationDays, true )
		  )
		: '';

	const isLessThanOneWeek = ! is_evergreen && activeDays < 7;

	const budgetRemainingFormatted =
		total_budget && total_budget_used
			? `$${ formatCents( total_budget - total_budget_used, 2 ) }`
			: '';
	const overallSpendingFormatted = activeDays
		? `$${ formatCents( total_budget_used || 0, 2 ) }`
		: '- ';

	const adPreviewLabel =
		// maybe we will need to edit this condition when we add more templates
		format !== 'html5_v2' ? (
			<div className="campaign-item-details__preview-header-dimensions">
				<span>{ `${ width }x${ height }` }</span>
			</div>
		) : (
			<div className="campaign-item-details__preview-header-preview-button">
				<AdPreviewModal templateFormat={ format || '' } htmlCode={ creative_html || '' } />
			</div>
		);

	const getDestinationLabel = () => {
		switch ( type ) {
			case 'post':
				return translate( 'Post page' );
			case 'page':
				return translate( 'Page' );
			case 'product':
				return translate( 'Product page' );
			default:
				return translate( 'Post page' );
		}
	};

	const icon = (
		<span className="campaign-item-details__support-buttons-icon">
			<svg
				width="16"
				height="17"
				viewBox="0 0 16 17"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M8 16.3193C12.4183 16.3193 16 12.7376 16 8.31934C16 3.90106 12.4183 0.319336 8 0.319336C3.58172 0.319336 0 3.90106 0 8.31934C0 12.7376 3.58172 16.3193 8 16.3193ZM13.375 11.9755C14.085 10.9338 14.5 9.67502 14.5 8.31934C14.5 7.08407 14.1554 5.92928 13.5571 4.94585L12.2953 5.75845C12.7428 6.50748 13 7.38337 13 8.31934C13 9.37572 12.6724 10.3556 12.1132 11.1629L13.375 11.9755ZM11.4245 13.8451L10.6121 12.5836C9.85194 13.0503 8.95739 13.3193 8 13.3193C7.04263 13.3193 6.1481 13.0503 5.38791 12.5836L4.57552 13.8451C5.56993 14.4627 6.74332 14.8193 8 14.8193C9.2567 14.8193 10.4301 14.4627 11.4245 13.8451ZM2.62498 11.9755C1.91504 10.9338 1.5 9.67503 1.5 8.31934C1.5 7.08405 1.84458 5.92926 2.44287 4.94582L3.70473 5.75842C3.25718 6.50745 3 7.38336 3 8.31934C3 9.37573 3.32761 10.3556 3.88678 11.1629L2.62498 11.9755ZM5.20588 4.17229C6.00361 3.63376 6.96508 3.31934 8 3.31934C9.03494 3.31934 9.99643 3.63377 10.7942 4.17232L11.6065 2.91084C10.5746 2.22134 9.33424 1.81934 8 1.81934C6.66578 1.81934 5.42544 2.22133 4.39351 2.91081L5.20588 4.17229ZM8 11.8193C9.933 11.8193 11.5 10.2523 11.5 8.31934C11.5 6.38634 9.933 4.81934 8 4.81934C6.067 4.81934 4.5 6.38634 4.5 8.31934C4.5 10.2523 6.067 11.8193 8 11.8193Z"
					fill="#1E1E1E"
				/>
			</svg>
		</span>
	);

	const cancelCampaignButtonText =
		status === 'active' ? __( 'Stop campaign' ) : __( 'Cancel campaign' );
	const cancelCampaignConfirmButtonText =
		status === 'active' ? __( 'Yes, stop' ) : __( 'Yes, cancel' );
	const cancelCampaignTitle =
		status === 'active' ? __( 'Stop the campaign' ) : __( 'Cancel the campaign' );
	const cancelCampaignMessage =
		status === 'active'
			? __( 'If you continue, your campaign will immediately stop running.' )
			: __(
					"If you continue, an approval request for your ad will be canceled, and the campaign won't start."
			  );

	const shouldShowStats =
		!! ui_status && ! [ 'created', 'rejected', 'scheduled' ].includes( ui_status );

	const buttons = [
		{
			action: 'cancel',
			isPrimary: true,
			label: __( 'No' ),
		},
		{
			action: 'remove',
			label: cancelCampaignConfirmButtonText,
			onClick: async () => {
				setShowDeleteDialog( false );
				cancelCampaign( siteId ?? 0, campaignId ?? 0 );
			},
		},
	];

	const errorDialogButtons = [
		{
			action: 'remove',
			label: __( 'Contact support' ),
			onClick: async () => {
				setShowErrorDialog( false );
				const localizedUrl = localizeUrl( 'https://wordpress.com/support/' );
				window.open( localizedUrl, '_blank' );
			},
		},
		{
			action: 'cancel',
			isPrimary: true,
			label: __( 'Ok' ),
		},
	];

	return (
		<div className="campaign-item__container">
			<Dialog
				isVisible={ showDeleteDialog }
				buttons={ buttons }
				onClose={ () => setShowDeleteDialog( false ) }
			>
				<h1>{ cancelCampaignTitle }</h1>
				<p>{ cancelCampaignMessage }</p>
			</Dialog>

			<Dialog
				isVisible={ showErrorDialog }
				buttons={ errorDialogButtons }
				onClose={ () => setShowErrorDialog( false ) }
			>
				<h1>{ __( "Something's gone wrong" ) }</h1>
				<p>{ __( 'Please try again later or contact support if the problem persists.' ) }</p>
			</Dialog>

			<header className="campaign-item-header">
				<div>
					<div className="campaign-item-breadcrumb">
						{ ! isLoading ? (
							<WPButton
								className="campaign-item-details-back-button"
								onClick={ () =>
									page.show( getAdvertisingDashboardPath( `/campaigns/${ selectedSiteSlug }` ) )
								}
								target="_blank"
								variant="link"
							>
								<Icon icon={ chevronLeft } size={ 16 } />
								{ translate( 'Go Back' ) }
							</WPButton>
						) : (
							<FlexibleSkeleton />
						) }
					</div>

					<div className="campaign-item-details__header-title">
						{ isLoading ? <FlexibleSkeleton /> : campaignTitleFormatted }
					</div>

					<div className="campaign-item__header-status">
						{ ! isLoading && status ? (
							<Badge type={ getCampaignStatusBadgeColor( ui_status ) }>
								{ getCampaignStatus( ui_status ) }
							</Badge>
						) : (
							<div
								style={ {
									height: '20px',
								} }
							>
								<FlexibleSkeleton />
							</div>
						) }

						{ ! isLoading ? (
							<>
								<span>&bull;</span>
								<div className="campaign-item__header-status-item">
									{ translate( 'Created:' ) } { campaignCreatedFormatted }
								</div>
								<span>&bull;</span>
								<div className="campaign-item__header-status-item">
									{ translate( 'Author:' ) } { display_name }
								</div>
							</>
						) : (
							<FlexibleSkeleton />
						) }
					</div>
				</div>

				{ ! isLoading && status && (
					<div className="campaign-item-details__support-buttons-container">
						<div className="campaign-item-details__support-buttons">
							{ ! isLoading && status ? (
								<>
									<Button
										className="contact-support-button"
										href={ localizeUrl( 'https://wordpress.com/help/contact' ) }
										target="_blank"
									>
										{ icon }
										<span className="contact-support-button-text">
											{ translate( 'Contact Support' ) }
										</span>
									</Button>

									{ ! canCancelCampaign( status ) && (
										<WPButton
											variant="primary"
											className="promote-again-button"
											disabled={ ! isLoadingBillingSummary && paymentBlocked }
											onClick={ onClickPromote }
										>
											{ translate( 'Promote Again' ) }
										</WPButton>
									) }

									{ canCancelCampaign( status ) && (
										<Button
											scary
											className="cancel-campaign-button"
											onClick={ () => setShowDeleteDialog( true ) }
										>
											{ cancelCampaignButtonText }
										</Button>
									) }
								</>
							) : (
								<FlexibleSkeleton />
							) }
						</div>
					</div>
				) }
			</header>
			<hr className="campaign-item-details-header-line" />
			<Main wideLayout className="campaign-item-details">
				{ status === 'rejected' && (
					<Notice
						isReskinned
						showDismiss={ false }
						status="is-error"
						icon="notice-outline"
						className="promote-post-notice campaign-item-details__notice"
					>
						{ translate(
							'Your ad was not approved, please review our {{wpcomTos}}WordPress.com Terms{{/wpcomTos}} and {{advertisingTos}}Advertising Policy{{/advertisingTos}}.',
							{
								components: {
									wpcomTos: (
										<a
											href={ localizeUrl( 'https://wordpress.com/tos/' ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
									advertisingTos: (
										<a
											href="https://automattic.com/advertising-policy/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</Notice>
				) }

				{ status === 'suspended' && payment_links && payment_links.length > 0 && (
					<>
						<Notice
							isReskinned
							showDismiss={ false }
							status="is-error"
							icon="notice-outline"
							className="promote-post-notice campaign-item-details__notice campaign-suspended"
							text={ translate(
								'Your campaigns are suspended due to exceeding the credit limit. Please complete the payments using the provided links to resume your campaigns.'
							) }
						/>
					</>
				) }

				<section className="campaign-item-details__wrapper">
					<div className="campaign-item-details__main">
						{ status === 'suspended' && payment_links && payment_links.length > 0 && (
							<div className="campaign-item-details__payment-links-container">
								<div className="campaign-item-details__payment-links">
									<div className="campaign-item-details__payment-link-row">
										<div className="payment-link__label">{ translate( 'Date' ) }</div>
										<div className="payment-link__label">{ translate( 'Amount' ) }</div>
										<div>&nbsp;</div>
									</div>
									{ payment_links.map( ( info, index ) => (
										<div key={ index } className="campaign-item-details__payment-link-row">
											<div>{ moment( info.date ).format( 'MMMM DD, YYYY' ) }</div>
											<div>${ formatNumber( info.amount ) }</div>
											<div className="payment-link__link">
												<ExternalLink href={ info.url } target="_blank">
													{ translate( 'Pay' ) }
													{ getExternalLinkIcon() }
												</ExternalLink>
											</div>
										</div>
									) ) }
								</div>
							</div>
						) }

						<div className="campaign-item-details__main-stats-container">
							{ shouldShowStats && (
								<div className="campaign-item-details__main-stats campaign-item-details__impressions">
									<div className="campaign-item-details__main-stats-row ">
										<div>
											<span className="campaign-item-details__label">
												{ translate( 'Impressions' ) }
											</span>
											<span className="campaign-item-details__text wp-brand-font">
												{ ! isLoading ? impressionsTotal : <FlexibleSkeleton /> }
											</span>
										</div>
										<div>
											<span className="campaign-item-details__label">
												{ translate( 'Clicks' ) }
											</span>
											<span className="campaign-item-details__text wp-brand-font">
												{ ! isLoading ? clicksFormatted : <FlexibleSkeleton /> }
											</span>
										</div>
										<div>
											<span className="campaign-item-details__label">
												{ __( 'Cost-Per-Click' ) }
											</span>
											<span className="campaign-item-details__text wp-brand-font">
												{ ! isLoading ? cpcFormatted : <FlexibleSkeleton /> }
											</span>
											<span className="campaign-item-details__details">
												{ ! isLoading ? (
													`${ ctrFormatted } ${ __( 'Click-through rate' ) }`
												) : (
													<FlexibleSkeleton />
												) }
											</span>
										</div>
										{ isWooStore && status !== 'created' && (
											<>
												<div>
													<span className="campaign-item-details__label">
														{ translate( 'Conversion Value' ) }
														<InfoPopover
															className="campaign-item-data__info-button"
															position="bottom right"
														>
															{ __( 'Conversion Value:' ) }
															<br />
															<span className="popover-title">
																{ __(
																	'assigns a monetary value associated with each conversion. Example: If each sale is worth $50, and you had 10 sales, your conversion value would be $500.'
																) }
															</span>
														</InfoPopover>
													</span>
													<span className="campaign-item-details__text wp-brand-font">
														{ ! isLoading ? conversionValueFormatted : <FlexibleSkeleton /> }
													</span>
												</div>
												<div>
													<span className="campaign-item-details__label">
														{ translate( 'Conversions' ) }
														<InfoPopover
															className="campaign-item-data__info-button"
															position="bottom right"
														>
															{ __( 'Conversions:' ) }
															<br />
															<span className="popover-title">
																{ __(
																	'show how many people made a purchase or completed a specific goal that aligns with the objectives of the campaign.'
																) }
															</span>
														</InfoPopover>
													</span>
													<span className="campaign-item-details__text wp-brand-font">
														{ ! isLoading ? conversionsTotalFormatted : <FlexibleSkeleton /> }
													</span>
												</div>
												<div>
													<span className="campaign-item-details__label">
														{ translate( 'Conversion Rate' ) }
														<InfoPopover
															className="campaign-item-data__info-button"
															position="bottom right"
														>
															{ __( 'Conversion Rate:' ) }
															<br />
															<span className="popover-title">
																{ __(
																	'shows the percentage of users who made a purchase (or completed a specific goal that aligns with the objectives of the campaign) out of the total number of users who clicked on the ad. Example: If your ad receives 100 clicks, and 5 people make a purchase, your conversion rate would be 5%.'
																) }
															</span>
														</InfoPopover>
													</span>
													<span className="campaign-item-details__text wp-brand-font">
														{ ! isLoading ? conversionsRateFormatted : <FlexibleSkeleton /> }
													</span>
												</div>
											</>
										) }
									</div>
								</div>
							) }

							<div className="campaign-item-details__main-stats-row">
								<div>
									<span className="campaign-item-details__label">
										{ is_evergreen && status === 'active'
											? __( 'Duration so far' )
											: __( 'Duration' ) }
									</span>
									<span className="campaign-item-details__text wp-brand-font">
										{ ! isLoading ? durationDateFormatted : <FlexibleSkeleton /> }
									</span>
									<span className="campaign-item-details__details">
										{ ! isLoading ? durationFormatted : <FlexibleSkeleton /> }
									</span>
								</div>
								{ is_evergreen ? (
									<div>
										<span className="campaign-item-details__label">{ __( 'Weekly spend' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? (
												<>
													{ weeklySpendFormatted }{ ' ' }
													<span className="campaign-item-details__details">
														/ { totalBudgetFormatted }
													</span>
												</>
											) : (
												<FlexibleSkeleton />
											) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? weeklySpendingPercentageFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
								) : (
									<div>
										<span className="campaign-item-details__label">{ __( 'Budget' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? totalBudgetFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? (
												`${ budgetRemainingFormatted } remaining`
											) : (
												<FlexibleSkeleton />
											) }
										</span>
									</div>
								) }
								<div>
									<span className="campaign-item-details__label">
										{ translate( 'Overall spending' ) }
									</span>
									<span className="campaign-item-details__text wp-brand-font">
										{ ! isLoading ? overallSpendingFormatted : <FlexibleSkeleton /> }
									</span>
								</div>
							</div>
						</div>

						<div className="campaign-item-details__main-stats-container">
							<div className="campaign-item-details__secondary-stats">
								<div className="campaign-item-details__secondary-stats-row">
									{ isLessThanOneWeek ? (
										<div>
											<span className="campaign-item-details__label">
												{ ! isLoading ? translate( 'Daily budget' ) : <FlexibleSkeleton /> }
											</span>
											<span className="campaign-item-details__text wp-brand-font">
												{ ! isLoading ? dailyAverageSpendingFormatted : <FlexibleSkeleton /> }
											</span>
											<span className="campaign-item-details__details">
												{ ! isLoading ? translate( 'Daily average spend' ) : <FlexibleSkeleton /> }
											</span>
										</div>
									) : (
										<div>
											<span className="campaign-item-details__label">
												{ ! isLoading ? translate( 'Weekly budget' ) : <FlexibleSkeleton /> }
											</span>
											<span className="campaign-item-details__text wp-brand-font">
												{ ! isLoading ? weeklyBudgetFormatted : <FlexibleSkeleton /> }
											</span>
											<span className="campaign-item-details__details">
												{ ! isLoading ? (
													/* translators: Daily average spend. dailyAverageSpending is the budget */
													translate( 'Daily av. spend: $%(dailyAverageSpending)s', {
														args: { dailyAverageSpending: dailyAverageSpending },
													} )
												) : (
													<FlexibleSkeleton />
												) }
											</span>
										</div>
									) }

									<div>
										<span className="campaign-item-details__label">
											{ is_evergreen ? __( 'Weekly impressions' ) : __( 'Estimated impressions' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? deliveryEstimateFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? (
												/* translators: Daily average spend. dailyAverageSpending is the budget */
												__( 'Impressions are estimated' )
											) : (
												<FlexibleSkeleton />
											) }
										</span>
									</div>
								</div>
								<div className="campaign-item-details__secondary-stats-interests-mobile">
									<>
										<span className="campaign-item-details__label">
											{ translate( 'Interests' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? topicsListFormatted : <FlexibleSkeleton /> }
										</span>
									</>
								</div>

								<div className="campaign-item-details__secondary-stats-row">
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Campaign objective' ) }
										</span>
										<span className="campaign-item-details__details objective">
											{ ! isLoading && ! campaignObjectivesIsLoading ? (
												objectiveFormatted
											) : (
												<FlexibleSkeleton />
											) }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Audience' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? devicesListFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Languages' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? languagesListFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
									<div className="campaign-item-details-interests">
										<span className="campaign-item-details__label">
											{ translate( 'Interests' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? topicsListFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Location' ) }
										</span>
										<span className="campaign-item-details__details campaign-item-details__locations">
											{ ! isLoading ? (
												<TargetLocations audienceList={ audience_list } />
											) : (
												<FlexibleSkeleton />
											) }
										</span>
									</div>
									<div className="campaign-item-details__destination">
										<span className="campaign-item-details__label">
											{ translate( 'Destination' ) }
										</span>
										<div className="campaign-item-details__ad-destination-url-container">
											{ ! isLoading ? (
												<Button
													className="campaign-item-details__ad-destination-url-link"
													href={ clickUrl }
													target="_blank"
												>
													{ getDestinationLabel() }
													{ getExternalLinkIcon() }
												</Button>
											) : (
												<FlexibleSkeleton />
											) }
										</div>
									</div>
								</div>
							</div>
						</div>
						{ canDisplayPaymentSection ? (
							<div className="campaign-item-details__payment-container">
								<div className="campaign-item-details__payment">
									<div className="campaign-item-details__payment-row ">
										{ orders && orders.length > 0 && (
											<div className="campaign-item-details__weekly-orders-row">
												<div className="campaign-item-details__weekly-label"></div>
												<div className="campaign-item-details__weekly-duration">
													<span className="campaign-item-details__label">
														{ translate( 'Duration' ) }
													</span>
												</div>
												<div className="campaign-item-details__weekly-amount">
													<span className="campaign-item-details__label">
														{ translate( 'Amount' ) }
													</span>
												</div>
											</div>
										) }
										{ orders && orders.length > 0
											? orders.map( ( order: Order, index: number ) => {
													const { lineItems, createdAt } = order;

													// Only sum the total of the line items that belong to the current
													// campaign (orders can have multiple campaigns)
													let campaignTotal = 0;
													lineItems.forEach( ( item ) => {
														if ( item.campaignId === campaignId ) {
															campaignTotal += +item.total;
														}
													} );

													// Format the total to display it
													const campaignTotalFormatted = formatCents( campaignTotal, 2 );

													// Format the date for display
													const formatDuration = ( createdAt: string ) => {
														const originalDate = moment( createdAt );

														// We only have the "created at" date stored, so we need to subtract a week to match the billing cycle
														let periodStart = originalDate.clone().subtract( 7, 'days' );

														if ( periodStart.isBefore( moment( start_date ) ) ) {
															periodStart = moment( start_date );
														}

														return `${ periodStart.format( 'MMM, D' ) } - ${ originalDate.format(
															'MMM, D'
														) }`;
													};

													const durationFormatted = formatDuration( createdAt );

													return (
														<div key={ index } className="campaign-item-details__weekly-orders-row">
															<div className="campaign-item-details__weekly-label">
																{ is_evergreen ? __( 'Weekly spent' ) : __( 'Weekly total' ) }
															</div>
															<div className="campaign-item-details__weekly-duration">
																{ durationFormatted }
															</div>
															<div className="campaign-item-details__weekly-amount">
																${ campaignTotalFormatted }
															</div>
														</div>
													);
											  } )
											: [] }
										{ orders && orders.length > 0 && (
											<div className="campaign-item-details__weekly-orders-row">
												<div className="campaign-item-details__weekly-orders-seperator"></div>
											</div>
										) }
										<div className="campaign-item-details__secondary-payment-row">
											{ payment_method && card_name && (
												<>
													<div className="campaign-item-details__payment-method">
														<span className="campaign-item-details__label">
															{ translate( 'Payment method' ) }
														</span>
														<span>{ card_name }</span>
														{ payment_method && <span>{ payment_method }</span> }
													</div>
													<hr className="campaign-item-details-footer-line" />
												</>
											) }
											<div className="campaign-item-details__total">
												{ credits ? (
													<span className="campaign-item-details__label">
														<div>{ translate( 'Credits' ) }</div>
														<div className="amount">{ creditsFormatted }</div>
													</span>
												) : (
													[]
												) }
												{ ! isNaN( total || 0 ) ? (
													<div>
														<span className="campaign-item-details__label">
															<div>{ translate( 'Total' ) }</div>
															<div className="amount">{ totalFormatted }</div>
														</span>
														<p className="campaign-item-details__payment-charges-disclosure">
															{ translate( 'Promotional codes are not included.' ) }
															<br />
															{ translate( 'All charges inclusive of VAT, if any.' ) }
														</p>
													</div>
												) : (
													[]
												) }
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							[]
						) }
					</div>
					<div className="campaign-item-details__preview">
						<div className="campaign-item-details__preview-container">
							<div className="campaign-item-details__preview-header">
								<div className="campaign-item-details__preview-header-title">
									{ translate( 'This ad is responsive' ) }
								</div>
								<div className="campaign-item-details__preview-header-label">
									{ ! isLoading ? <>{ adPreviewLabel }</> : <FlexibleSkeleton /> }
								</div>
							</div>
							<AdPreview
								isLoading={ isLoading }
								htmlCode={ creative_html || '' }
								templateFormat={ format || '' }
								width={ format === 'html5_v2' ? '100%' : '300px' }
							/>
							<div className="campaign-item-details__preview-disclosure">
								{ getExternalTabletIcon() }
								<span className="preview-disclosure-text">
									{ translate(
										'Depending on the platform, the ad may look different from the preview.'
									) }
								</span>
							</div>
						</div>

						<div className="campaign-item-details__support-buttons-container">
							<div className="campaign-item-details__support-buttons-mobile">
								{ ! isLoading && status ? (
									<>
										<Button
											className="contact-support-button"
											href={ localizeUrl( 'https://wordpress.com/help/contact' ) }
											target="_blank"
										>
											{ icon }
											{ translate( 'Contact Support' ) }
										</Button>

										{ canCancelCampaign( status ) && (
											<Button
												scary
												className="cancel-campaign-button"
												onClick={ () => setShowDeleteDialog( true ) }
											>
												{ cancelCampaignButtonText }
											</Button>
										) }
									</>
								) : (
									<FlexibleSkeleton />
								) }
							</div>
							<div className="campaign-item-details__support-articles-wrapper">
								<div className="campaign-item-details__support-heading">
									{ translate( 'Support articles' ) }
								</div>
								{ /*
								commented out until we get the link
								<Button className="is-link campaign-item-details__support-effective-ad-doc">
									{ translate( 'What makes an effective ad?' ) }
									{ getExternalLinkIcon() }
								</Button>*/ }

								<InlineSupportLink
									className="is-link components-button campaign-item-details__support-link"
									supportContext="advertising"
									showIcon={ false }
									showSupportModal={ ! isRunningInWpAdmin }
								>
									{ translate( 'View documentation' ) }
									{ getExternalLinkIcon() }
								</InlineSupportLink>
								<div className="campaign-item-details__powered-by">
									{ isWooStore ? (
										<span>{ translate( 'Woo Blaze - Powered by Jetpack' ) }</span>
									) : (
										<span>{ translate( 'Blaze - Powered by Jetpack' ) }</span>
									) }
								</div>
							</div>
						</div>
					</div>
				</section>
			</Main>
		</div>
	);
}

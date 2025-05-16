import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { safeImageUrl } from '@automattic/calypso-url';
import { Badge, Tooltip } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Campaign } from 'calypso/data/promote-post/types';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { hasTouch } from 'calypso/lib/touch-detect';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	campaignStatus,
	formatCents,
	formatNumber,
	getAdvertisingDashboardPath,
	getCampaignBudgetData,
	getCampaignStartDateFormatted,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
} from '../../utils';
import './style.scss';

interface Props {
	campaign: Campaign;
}

const getCampaignEndText = ( end_date: string, status: string, is_evergreen = 0 ) => {
	if ( is_evergreen && [ campaignStatus.APPROVED, campaignStatus.ACTIVE ].includes( status ) ) {
		return __( 'Until stopped' );
	} else if ( ! end_date ) {
		return '-';
	}

	// return moment in format similar to 27 June
	return moment( end_date ).format( 'D MMMM' );
};

export default function CampaignItem( props: Props ) {
	const { campaign } = props;
	const {
		name,
		content_config,
		ui_status,
		end_date,
		budget_cents,
		start_date,
		campaign_stats,
		type,
		is_evergreen,
	} = campaign;

	const clicks_total = campaign_stats?.clicks_total ?? 0;
	const spent_budget_cents = campaign_stats?.spent_budget_cents ?? 0;
	const conversion_rate_percentage = campaign_stats?.conversion_rate
		? campaign_stats.conversion_rate * 100
		: 0;
	const conversion_rate = campaign_stats?.conversion_rate
		? `${ conversion_rate_percentage.toFixed( 2 ) }%`
		: '-';

	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const safeUrl = safeImageUrl( content_config.imageUrl );
	const adCreativeUrl = safeUrl && resizeImageUrl( safeUrl, 108, 0 );

	const { totalBudgetUsed, campaignDays } = useMemo(
		() =>
			getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents, is_evergreen ),
		[ budget_cents, end_date, spent_budget_cents, start_date, is_evergreen ]
	);

	const formattedTotalSpend = `$${ formatCents( totalBudgetUsed || 0, 2 ) }`;

	let spendString = '-';
	let spendStringMobile = '';
	if ( campaignDays && ui_status !== campaignStatus.REJECTED ) {
		/* translators: Daily average spend. dailyAverageSpending is the budget */
		spendString = formattedTotalSpend;
		spendStringMobile = sprintf(
			/* translators: %s is a formatted amount */
			translate( '%s spend' ),
			formattedTotalSpend
		);
	}

	const isWooStore = config.isEnabled( 'is_running_in_woo_site' );

	const getPostType = ( type: string ) => {
		switch ( type ) {
			case 'post':
				return translate( 'Post' );
			case 'page':
				return translate( 'Page' );
			case 'product':
				return translate( 'Product' );
			default:
				return translate( 'Post' );
		}
	};

	const statusBadge = (
		<Badge type={ getCampaignStatusBadgeColor( ui_status ) }>
			{ getCampaignStatus( ui_status ) }
		</Badge>
	);
	const openCampaignURL = getAdvertisingDashboardPath(
		`/campaigns/${ campaign.campaign_id }/${ selectedSiteSlug }`
	);

	const navigateToDetailsPage = ( event: React.MouseEvent< HTMLElement > ) => {
		event.stopPropagation();
		page.show( openCampaignURL );
	};

	const campaignIdString = campaign.campaign_id.toString();
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const tooltipRef = useRef< HTMLDivElement >( null );
	const isTouch = hasTouch();

	function getMobileStats() {
		const statElements = [];

		if ( spendStringMobile ) {
			statElements[ statElements.length ] = spendStringMobile;
		}

		if ( clicks_total > 0 ) {
			statElements[ statElements.length ] = sprintf(
				// translators: %s is formatted number of clicks
				_n( '%s click', '%s clicks', clicks_total ),
				formatNumber( clicks_total )
			);
		}

		return statElements.map( ( value, index ) => {
			if ( index < statElements.length - 1 ) {
				return (
					<Fragment key={ index }>
						<span>{ value }</span>
						<span className="blazepress-mobile-stats-mid-dot">&#183;</span>
					</Fragment>
				);
			}

			return <span key={ index }>{ value }</span>;
		} );
	}

	return (
		<tr onClick={ navigateToDetailsPage }>
			<td className="campaign-item__data">
				<div className="campaign-item__data-row">
					<div className="promote-post-i2__campaign-item-wrapper">
						{ adCreativeUrl && (
							<div className="campaign-item__header-image">
								<img
									src={ adCreativeUrl }
									alt={ translate( 'For campaign %(name)s', {
										args: { name },
									} ).toString() }
								/>
							</div>
						) }
						<div className="campaign-item__title-row">
							<div className="campaign-item__post-type">{ getPostType( type ) }</div>
							<div className="campaign-item__title">{ name }</div>
							<div className="campaign-item__status-mobile">{ statusBadge }</div>
						</div>
					</div>
				</div>
				<div className="campaign-item__data-row campaign-item__data-row-mobile">
					<div className="campaign-item__stats-mobile">{ getMobileStats() }</div>
					<div className="campaign-item__actions-mobile">
						<Button
							onClick={ navigateToDetailsPage }
							variant="primary"
							className="campaign-item__view-link"
						>
							<span aria-hidden="true">{ __( 'Details' ) }</span>
							<span className="sr-only">
								{ translate( 'View details for %(name)s', {
									args: { name },
								} ) }
							</span>
						</Button>
					</div>
				</div>
			</td>
			<td className="campaign-item__status">
				{ ui_status === campaignStatus.SCHEDULED ? (
					<>
						<div
							ref={ tooltipRef }
							onMouseEnter={ () => ! isTouch && setActiveTooltipId( campaignIdString ) }
							onMouseLeave={ () => ! isTouch && setActiveTooltipId( '' ) }
						>
							{ statusBadge }
						</div>
						<Tooltip
							className="import__campaign-schedule-tooptip"
							position="bottom"
							hideArrow
							context={ tooltipRef.current }
							isVisible={ activeTooltipId === campaignIdString }
						>
							<div>{ getCampaignStartDateFormatted( start_date ) }</div>
						</Tooltip>
					</>
				) : (
					<div>{ statusBadge }</div>
				) }
			</td>
			<td className="campaign-item__ends">
				<div>
					{ getCampaignEndText( campaign.end_date, campaign.status, campaign?.is_evergreen ) }
				</div>
			</td>
			<td className="campaign-item__spend">
				<div>{ spendString }</div>
			</td>
			<td className="campaign-item__clicks">
				<div>{ formatNumber( clicks_total ) }</div>
			</td>
			{ isWooStore && (
				<td className="campaign-item__conversion">
					<div>{ conversion_rate } </div>
				</td>
			) }

			<td className="campaign-item__action">
				<Button
					isBusy={ false }
					disabled={ false }
					onClick={ navigateToDetailsPage }
					className="campaign-item__post-details-button"
				>
					<span aria-hidden="true">{ __( 'Details' ) }</span>
					<span className="sr-only">
						{ translate( 'View details for %(name)s', {
							args: { name },
						} ) }
					</span>
				</Button>
			</td>
		</tr>
	);
}

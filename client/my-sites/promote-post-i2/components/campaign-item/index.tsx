import { safeImageUrl } from '@automattic/calypso-url';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import { useMemo } from 'react';
import Badge from 'calypso/components/badge';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	campaignStatus,
	formatCents,
	formatNumber,
	getAdvertisingDashboardPath,
	getCampaignBudgetData,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
	isCampaignFinished,
} from '../../utils';
import './style.scss';

interface Props {
	campaign: Campaign;
}

const getCampaignEndText = ( localizedMomentInstance: any, status: string, end_date: string ) => {
	if (
		[ campaignStatus.SCHEDULED, campaignStatus.CREATED, campaignStatus.REJECTED ].includes( status )
	) {
		return '-';
	} else if ( [ campaignStatus.APPROVED, campaignStatus.ACTIVE ].includes( status ) ) {
		return __( 'Ongoing' );
	} else if ( [ campaignStatus.CANCELED, campaignStatus.FINISHED ].includes( status ) ) {
		// return moment in format similar to 27 June
		return localizedMomentInstance( end_date ).format( 'D MMMM' );
	}
	return '-';
};

export default function CampaignItem( props: Props ) {
	const { campaign } = props;
	const {
		name,
		content_config,
		display_name,
		status,
		end_date,
		budget_cents,
		start_date,
		campaign_stats,
	} = campaign;

	const clicks_total = campaign_stats?.clicks_total ?? 0;
	const spent_budget_cents = campaign_stats?.spent_budget_cents ?? 0;
	const impressions_total = campaign_stats?.impressions_total ?? 0;

	const moment = useLocalizedMoment();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const safeUrl = safeImageUrl( content_config.imageUrl );
	const adCreativeUrl = safeUrl && resizeImageUrl( safeUrl, { h: 80 }, 0 );

	const { totalBudget, totalBudgetLeft, campaignDays } = useMemo(
		() => getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents ),
		[ budget_cents, end_date, spent_budget_cents, start_date ]
	);

	const totalBudgetLeftString = `($${ formatCents( totalBudgetLeft || 0 ) } ${ __( 'left' ) })`;
	const budgetString = campaignDays ? `$${ totalBudget } ${ totalBudgetLeftString }` : '-';
	const budgetStringMobile = campaignDays ? `$${ totalBudget } budget` : null;

	const campaignContainsData = isCampaignFinished( status );
	const statusBadge = (
		<Badge type={ getCampaignStatusBadgeColor( status ) }>{ getCampaignStatus( status ) }</Badge>
	);
	const openCampaignLink = 'javascript:void(0);'; // TODO: Provide a valid link for opening campaign details

	function getMobileStats() {
		const statElements = [];
		if ( impressions_total > 0 ) {
			statElements[ statElements.length ] = sprintf(
				// translators: %s is formatted number of views
				_n( '%s impressions', '%s impression', impressions_total ),
				formatNumber( impressions_total )
			);
		}

		if ( clicks_total > 0 ) {
			statElements[ statElements.length ] = sprintf(
				// translators: %s is formatted number of clicks
				_n( '%s clicks', '%s click', clicks_total ),
				formatNumber( clicks_total )
			);
		}

		if ( budgetStringMobile ) {
			statElements[ statElements.length ] = budgetStringMobile;
		}

		return statElements.map( ( value, index ) => {
			if ( index < statElements.length - 1 ) {
				return (
					<>
						<span key={ index }>{ value }</span>
						<span key={ `${ index }-dot` } className="blazepress-mobile-stats-mid-dot">
							&#183;
						</span>
					</>
				);
			}

			return <span key={ index }>{ value }</span>;
		} );
	}

	return (
		<tr>
			<td className="campaign-item__data">
				<div className="campaign-item__data-row">
					<div className="promote-post-i2__campaign-item-wrapper">
						{ adCreativeUrl && (
							<div className="campaign-item__header-image">
								<img src={ adCreativeUrl } alt="" />
							</div>
						) }
						<div className="campaign-item__title-row">
							<div className="campaign-item__title">{ name }</div>
							<div className="campaign-item__status-mobile">{ statusBadge }</div>
						</div>
					</div>
				</div>
				<div className="campaign-item__data-row campaign-item__data-row-mobile">
					<div className="campaign-item__stats-mobile">{ getMobileStats() }</div>
					<div className="campaign-item__actions-mobile">
						<a href={ openCampaignLink } className="campaign-item__view-link">
							{ __( 'Open details' ) }
						</a>
					</div>
				</div>
			</td>
			<td className="campaign-item__user">{ display_name }</td>
			<td className="campaign-item__status">{ statusBadge }</td>
			<td className="campaign-item__ends">
				{ getCampaignEndText( moment, campaign.status, campaign.end_date ) }
			</td>
			<td className="campaign-item__budget">{ budgetString }</td>
			<td className="campaign-item__impressions">{ formatNumber( impressions_total ) }</td>
			<td className="campaign-item__clicks">{ formatNumber( clicks_total ) }</td>
			<td className="campaign-item__action">
				{ campaignContainsData && (
					<Button
						href={ getAdvertisingDashboardPath(
							`/${ selectedSiteSlug }/campaigns/${ campaign.campaign_id }`
						) }
						isLink
						icon={ chevronRight }
					/>
				) }
			</td>
		</tr>
	);
}

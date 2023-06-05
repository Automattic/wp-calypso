import { safeImageUrl } from '@automattic/calypso-url';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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

	const campaignContainsData = isCampaignFinished( status );

	return (
		<tr>
			<td className="campaign-item__data">
				<div className="promote-post-i2__campaign-item-wrapper">
					{ adCreativeUrl && (
						<div className="campaign-item__header-image">
							<img src={ adCreativeUrl } alt="" />
						</div>
					) }
					<div className="campaign-item__title">{ name }</div>
				</div>
			</td>
			<td className="campaign-item__user">{ display_name }</td>
			<td className="campaign-item__status">
				<Badge type={ getCampaignStatusBadgeColor( status ) }>
					{ getCampaignStatus( status ) }
				</Badge>
			</td>
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

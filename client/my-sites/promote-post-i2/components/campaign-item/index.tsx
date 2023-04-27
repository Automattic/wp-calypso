import { safeImageUrl } from '@automattic/calypso-url';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import React, { useMemo } from 'react';
import Badge from 'calypso/components/badge';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	campaignStatus,
	formatCents,
	formatNumber,
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
		impressions_total,
		clicks_total,
		spent_budget_cents,
		start_date,
	} = campaign;

	const moment = useLocalizedMoment();

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
			<td>
				<div className="promote-post-i2__campaign-item-wrapper">
					{ adCreativeUrl && (
						<div className="campaign-item__header-image">
							<img src={ adCreativeUrl } alt="" />
						</div>
					) }
					{ name }
				</div>
			</td>
			<td>{ display_name }</td>
			<td>
				<Badge type={ getCampaignStatusBadgeColor( status ) }>
					{ getCampaignStatus( status ) }
				</Badge>
			</td>
			<td>{ getCampaignEndText( moment, campaign.status, campaign.end_date ) }</td>
			<td>{ budgetString }</td>
			<td>{ formatNumber( impressions_total ) }</td>
			<td>{ formatNumber( clicks_total ) }</td>
			<td>{ campaignContainsData && <Button icon={ chevronRight } /> }</td>
		</tr>
	);
}

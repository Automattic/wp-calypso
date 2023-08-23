import { safeImageUrl } from '@automattic/calypso-url';
import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import { Moment } from 'moment';
import page from 'page';
import { Fragment, useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { Campaign } from 'calypso/data/promote-post/types';
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
} from '../../utils';
import './style.scss';

interface Props {
	campaign: Campaign;
}
const getCampaignEndText = ( end_date: Moment, status: string ) => {
	if (
		[ campaignStatus.SCHEDULED, campaignStatus.CREATED, campaignStatus.REJECTED ].includes( status )
	) {
		return '-';
	} else if ( [ campaignStatus.APPROVED, campaignStatus.ACTIVE ].includes( status ) ) {
		return __( 'Ongoing' );
	} else if ( [ campaignStatus.CANCELED, campaignStatus.FINISHED ].includes( status ) ) {
		// return moment in format similar to 27 June
		return end_date.format( 'D MMMM' );
	}
	return '-';
};

export default function CampaignItem( props: Props ) {
	const { campaign } = props;
	const {
		name,
		content_config,
		display_name,
		ui_status,
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
	const adCreativeUrl = safeUrl && resizeImageUrl( safeUrl, 108, 0 );

	const { totalBudget, totalBudgetLeft, campaignDays } = useMemo(
		() => getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents ),
		[ budget_cents, end_date, spent_budget_cents, start_date ]
	);

	const totalBudgetLeftString = `($${ formatCents( totalBudgetLeft || 0 ) } ${ __( 'left' ) })`;
	const budgetString = campaignDays ? `$${ totalBudget } ${ totalBudgetLeftString }` : '-';
	const budgetStringMobile = campaignDays ? `$${ totalBudget } budget` : null;

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

	function getMobileStats() {
		const statElements = [];
		if ( impressions_total > 0 ) {
			statElements[ statElements.length ] = sprintf(
				// translators: %s is formatted number of views
				_n( '%s impression', '%s impressions', impressions_total ),
				formatNumber( impressions_total )
			);
		}

		if ( clicks_total > 0 ) {
			statElements[ statElements.length ] = sprintf(
				// translators: %s is formatted number of clicks
				_n( '%s click', '%s clicks', clicks_total ),
				formatNumber( clicks_total )
			);
		}

		if ( budgetStringMobile ) {
			statElements[ statElements.length ] = budgetStringMobile;
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
							<div
								className="campaign-item__header-image"
								style={ { backgroundImage: `url(${ adCreativeUrl })` } }
							></div>
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
						<Button
							onClick={ navigateToDetailsPage }
							variant="link"
							className="campaign-item__view-link"
						>
							{ __( 'Open details' ) }
						</Button>
					</div>
				</div>
			</td>
			<td className="campaign-item__user">
				<div>{ display_name }</div>
			</td>
			<td className="campaign-item__status">
				<div>{ statusBadge }</div>
			</td>
			<td className="campaign-item__ends">
				<div>{ getCampaignEndText( moment( campaign.end_date ), campaign.status ) }</div>
			</td>
			<td className="campaign-item__budget">
				<div>{ budgetString }</div>
			</td>
			<td className="campaign-item__impressions">
				<div>{ formatNumber( impressions_total ) }</div>
			</td>
			<td className="campaign-item__clicks">
				<div>{ formatNumber( clicks_total ) }</div>
			</td>
			<td className="campaign-item__action">
				<Button onClick={ navigateToDetailsPage } variant="link" icon={ chevronRight } />
			</td>
		</tr>
	);
}

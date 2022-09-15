import './style.scss';
import { safeImageUrl } from '@automattic/calypso-url';
import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import FoldableCard from 'calypso/components/foldable-card';
import Notice from 'calypso/components/notice';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import useCancelCampaignMutation from 'calypso/data/promote-post/use-promote-post-cancel-campaign-mutation';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	canCancelCampaign,
	getCampaignAudienceString,
	getCampaignBudgetData,
	getCampaignClickthroughRate,
	getCampaignDurationFormatted,
	getCampaignEstimatedReach,
	getCampaignOverallSpending,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
	getPostType,
} from 'calypso/my-sites/promote-post/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type Props = {
	campaign: Campaign;
};

export default function CampaignItem( { campaign }: Props ) {
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );

	const { cancelCampaign } = useCancelCampaignMutation();

	const {
		impressions_total,
		status: campaignStatus,
		clicks_total,
		target_url,
		type,
		content_config,
		moderation_reason,
		spent_budget_cents,
		start_date,
		end_date,
		budget_cents,
		audience_list,
		impressions_estimated_total,
		deliver_margin_multiplier,
		display_name,
	} = campaign;

	const overallSpending = useMemo(
		() => getCampaignOverallSpending( spent_budget_cents, start_date, end_date ),
		[ spent_budget_cents, start_date, end_date ]
	);

	const clickthroughRate = useMemo(
		() => getCampaignClickthroughRate( clicks_total, impressions_total ),
		[ clicks_total || 0, impressions_total ]
	);

	const durationFormatted = useMemo(
		() => getCampaignDurationFormatted( start_date, end_date ),
		[ start_date, end_date ]
	);

	const { totalBudget, totalBudgetLeft } = useMemo(
		() => getCampaignBudgetData( budget_cents, spent_budget_cents ),
		[ budget_cents, spent_budget_cents ]
	);
	const totalBudgetLeftString = totalBudgetLeft ? `($${ totalBudgetLeft } ${ __( 'left' ) })` : '';

	const estimatedReach = useMemo(
		() => getCampaignEstimatedReach( impressions_estimated_total, deliver_margin_multiplier ),
		[ impressions_estimated_total, deliver_margin_multiplier ]
	);

	const audience = useMemo( () => getCampaignAudienceString( audience_list ), [ audience_list ] );

	const safeUrl = safeImageUrl( content_config.imageUrl );
	const adCreativeUrl = safeUrl && resizeImageUrl( safeUrl, { h: 80 }, 0 );

	const header = (
		<div className="campaign-item__header">
			<div className="campaign-item__header-content">
				<div className="campaign-item__display-name">{ display_name }</div>
				<div className="campaign-item__header-title">{ content_config.title }</div>
				<div className="campaign-item__header-status">
					<Badge type={ getCampaignStatusBadgeColor( campaignStatus ) }>
						{ getCampaignStatus( campaignStatus ) }
					</Badge>
				</div>
			</div>
			{ adCreativeUrl && (
				<div className="campaign-item__header-image">
					<img src={ adCreativeUrl } alt="" />
				</div>
			) }
		</div>
	);

	const cancelCampaignButtonText =
		campaignStatus === 'active' ? __( 'Stop campaign' ) : __( 'Cancel campaign' );
	const cancelCampaignConfirmButtonText =
		campaignStatus === 'active' ? __( 'Yes, stop' ) : __( 'Yes, cancel' );
	const cancelCampaignTitle =
		campaignStatus === 'active' ? __( 'Stop the campaign' ) : __( 'Cancel the campaign' );
	const cancelCampaignMessage =
		campaignStatus === 'active'
			? __( 'If you continue, your campaign will immediately stop running.' )
			: __(
					"If you continue, an approval request for your ad will be canceled, and the campaign won't start."
			  );

	const buttons = [
		{
			action: 'cancel',
			label: __( 'No' ),
		},
		{
			action: 'remove',
			isPrimary: true,
			label: cancelCampaignConfirmButtonText,
			onClick: async () => {
				setShowDeleteDialog( false );
				cancelCampaign( siteId, campaign.campaign_id );
			},
		},
	];

	return (
		<>
			<Dialog
				isVisible={ showDeleteDialog }
				buttons={ buttons }
				onClose={ () => setShowDeleteDialog( false ) }
			>
				<h1>{ cancelCampaignTitle }</h1>
				<p>{ cancelCampaignMessage }</p>
			</Dialog>

			<FoldableCard header={ header } hideSummary={ true } className="campaign-item__foldable-card">
				{ campaignStatus === 'rejected' && moderation_reason && (
					<Notice status="is-warning" showDismiss={ false }>
						{ __( 'Your ad is rejected: ' ) } { moderation_reason }
					</Notice>
				) }

				<div className="campaign-item__section campaign-item__stats">
					<div className="campaign-item__row campaign-item__stats-row1">
						<div className="campaign-item__column campaign-item__reach">
							<div className="campaign-item__block_label campaign-item__reach-label">
								{ __( 'Impressions' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__reach-value">
								{ impressions_total || 0 }
							</div>
						</div>
						<div className="campaign-item__column campaign-item__clicks">
							<div className="campaign-item__block_label campaign-item__clicks-label">
								{ __( 'Clicks' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__clicks-value">
								{ clicks_total || 0 }
							</div>
						</div>
						<div className="campaign-item__placeholder"></div>
					</div>
					<div className="campaign-item__row campaign-item__stats-row2">
						<div className="campaign-item__column campaign-item__budget">
							<div className="campaign-item__block_label campaign-item__budget-label">
								{ __( 'Overall spending' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__budget-value">
								{ overallSpending }
							</div>
						</div>
						<div className="campaign-item__column campaign-item__clicks">
							<div className="campaign-item__block_label campaign-item__clickthrough-label">
								{ __( 'Click-through rate' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__clickthrough-value">
								{ clickthroughRate }%
							</div>
						</div>
					</div>
				</div>
				<div className="campaign-item__section campaign-item__config">
					<div className="campaign-item__row campaign-item__goal-row1">
						<div className="campaign-item__column campaign-item__duration">
							<div className="campaign-item__block_label campaign-item__duration-label">
								{ __( 'Duration' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__duration-value">
								{ durationFormatted }
							</div>
						</div>

						<div className="campaign-item__column campaign-item__budget">
							<div className="campaign-item__block_label campaign-item__budget-label">
								{ __( 'Budget' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__budget-value">{ `$${ totalBudget } ${ totalBudgetLeftString }` }</div>
						</div>
					</div>

					<div className="campaign-item__row campaign-item__goal-row2">
						<div className="campaign-item__column campaign-item__estimated-reach">
							<div className="campaign-item__block_label campaign-item__estimated-reach-label">
								{ __( 'Estimated reach' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__estimated-reach-value">
								{ estimatedReach }
							</div>
						</div>

						<div className="campaign-item__column campaign-item__target">
							<div className="campaign-item__block_label campaign-item__target-label">
								{ __( 'Ad destination' ) } ({ getPostType( type ) })
							</div>
							<div className="campaign-item__block_value campaign-item__target-value">
								{ target_url ? (
									<a href={ target_url } target="_blank" rel="noreferrer">
										{ target_url }
									</a>
								) : (
									'-'
								) }
							</div>
						</div>
					</div>

					<div className="campaign-item__row campaign-item__audience-row3">
						<div className="campaign-item__column campaign-item__audience">
							<div className="campaign-item__block_label campaign-item__audience-label">
								{ __( 'Audience' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__audience-value">
								{ audience }
							</div>
						</div>
					</div>
				</div>
				<div className="campaign-item__payment-and-action">
					{ canCancelCampaign( campaignStatus ) && (
						<Button isLink isDestructive onClick={ () => setShowDeleteDialog( true ) }>
							{ cancelCampaignButtonText }
						</Button>
					) }
				</div>
			</FoldableCard>
		</>
	);
}

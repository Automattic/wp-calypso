import './style.scss';
import { safeImageUrl } from '@automattic/calypso-url';
import { Badge, Dialog, Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import { Campaign } from 'calypso/data/promote-post/types';
import useCancelCampaignMutation from 'calypso/data/promote-post/use-promote-post-cancel-campaign-mutation';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	canCancelCampaign,
	formatCents,
	getCampaignBudgetData,
	getCampaignClickthroughRate,
	getCampaignDurationFormatted,
	getCampaignEstimatedImpressions,
	getCampaignOverallSpending,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
	getPostType,
	normalizeCampaignStatus,
} from 'calypso/my-sites/promote-post/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AdPreview from '../ad-preview';
import AudienceBlock from '../audience-block';

type Props = {
	campaign: Campaign;
	expanded: boolean;
	onClickCampaign: ( isExpanded: boolean ) => void;
};

export default function CampaignItem( { campaign, expanded, onClickCampaign }: Props ) {
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ showErrorDialog, setShowErrorDialog ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );
	const localizeUrl = useLocalizeUrl();
	const translate = useTranslate();

	const { cancelCampaign } = useCancelCampaignMutation( () => setShowErrorDialog( true ) );

	const {
		type,
		content_config,
		moderation_reason,
		start_date,
		end_date,
		budget_cents,
		audience_list,
		display_delivery_estimate,
		display_name,
		creative_html,
		target_url = '',
		campaign_stats_loading,
		campaign_stats,
	} = campaign;

	const clicks_total = campaign_stats?.clicks_total ?? 0;
	const spent_budget_cents = campaign_stats?.spent_budget_cents ?? 0;
	const impressions_total = campaign_stats?.impressions_total ?? 0;

	const campaignStatus = useMemo( () => normalizeCampaignStatus( campaign ), [ campaign ] );

	const overallSpending = useMemo(
		() => getCampaignOverallSpending( spent_budget_cents, budget_cents, start_date, end_date ),
		[ spent_budget_cents, budget_cents, start_date, end_date ]
	);

	const clickthroughRate = useMemo(
		() => getCampaignClickthroughRate( clicks_total || 0, impressions_total || 0 ),
		[ clicks_total, impressions_total ]
	);

	const durationFormatted = useMemo(
		() => getCampaignDurationFormatted( start_date, end_date ),
		[ start_date, end_date ]
	);

	const { totalBudget, totalBudgetLeft, campaignDays } = useMemo(
		() => getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents ),
		[ budget_cents, end_date, spent_budget_cents, start_date ]
	);
	const totalBudgetLeftString = `($${ formatCents( totalBudgetLeft || 0 ) } ${ __( 'left' ) })`;

	const estimatedImpressions = useMemo(
		() => getCampaignEstimatedImpressions( display_delivery_estimate ),
		[ display_delivery_estimate ]
	);

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
			isPrimary: true,
			label: __( 'No' ),
		},
		{
			action: 'remove',
			label: cancelCampaignConfirmButtonText,
			onClick: async () => {
				setShowDeleteDialog( false );
				cancelCampaign( siteId ?? 0, campaign.campaign_id );
			},
		},
	];

	const errorDialogButtons = [
		{
			action: 'remove',
			label: __( 'Contact support' ),
			onClick: async () => {
				setShowErrorDialog( false );
				window.open( localizeUrl( 'https://wordpress.com/support/' ), '_blank' );
			},
		},
		{
			action: 'cancel',
			isPrimary: true,
			label: __( 'Ok' ),
		},
	];

	const budgetString = campaignDays ? `$${ totalBudget } ${ totalBudgetLeftString }` : '-';

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

			<Dialog
				isVisible={ showErrorDialog }
				buttons={ errorDialogButtons }
				onClose={ () => setShowErrorDialog( false ) }
			>
				<h1>{ __( "Something's gone wrong" ) }</h1>
				<p>{ __( 'Please try again later or contact support if the problem persists.' ) }</p>
			</Dialog>

			<FoldableCard
				expanded={ expanded }
				onClick={ () => {
					onClickCampaign( ! expanded );
				} }
				clickableHeader
				header={ header }
				hideSummary={ true }
				className={ `campaign-item__foldable-card promote-post__campaigns_id_${ campaign.campaign_id }` }
			>
				<div className="campaign-item__row">
					<Notice isDismissible={ false } className="campaign-item__notice" status="info">
						<Gridicon className="campaign-item__notice-icon" icon="info-outline" />
						{ translate( 'Campaign statistics may be delayed by up to 3 hours.' ) }
					</Notice>
				</div>
				<div className="campaign-item__section campaign-item__stats">
					<div className="campaign-item__row campaign-item__stats-row1">
						<div className="campaign-item__column campaign-item__reach">
							<div className="campaign-item__block_label campaign-item__reach-label">
								{ __( 'Impressions' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__reach-value">
								{ campaign_stats_loading ? '-' : impressions_total.toLocaleString() }
							</div>
						</div>
						<div className="campaign-item__column campaign-item__clicks">
							<div className="campaign-item__block_label campaign-item__clicks-label">
								{ __( 'Clicks' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__clicks-value">
								{ campaign_stats_loading ? '-' : clicks_total.toLocaleString() }
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
								{ campaign_stats_loading ? '-' : clickthroughRate }%
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
							<div className="campaign-item__block_value campaign-item__budget-value">
								{ budgetString }
							</div>
						</div>
					</div>

					<div className="campaign-item__row campaign-item__goal-row2">
						<div className="campaign-item__column campaign-item__estimated-reach">
							<div className="campaign-item__block_label campaign-item__estimated-reach-label">
								{ __( 'Estimated impressions' ) }
							</div>
							<div className="campaign-item__block_value campaign-item__estimated-reach-value">
								{ estimatedImpressions }
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
								<AudienceBlock audienceList={ audience_list } />
							</div>
						</div>

						<div className="campaign-item__column campaign-item__adpreview">
							<div className="campaign-item__block_label campaign-item__adpreview-label">
								{ __( 'Ad Preview' ) }
							</div>
							<AdPreview htmlCode={ creative_html } />
						</div>
					</div>
				</div>
				<div className="campaign-item__payment-and-action">
					{ canCancelCampaign( campaignStatus ) && (
						<Button variant="link" isDestructive onClick={ () => setShowDeleteDialog( true ) }>
							{ cancelCampaignButtonText }
						</Button>
					) }
				</div>

				{ campaignStatus === 'rejected' && moderation_reason && (
					<Notice isDismissible={ false } className="campaign-item__notice" status="warning">
						<Gridicon className="campaign-item__notice-icon" icon="info-outline" />
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
			</FoldableCard>
		</>
	);
}

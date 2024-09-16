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
		billing_data,
		display_delivery_estimate = '',
		target_urn,
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
		keyValue: `post-${ getPostIdFromURN( target_urn || '' ) }`, // + campaignId,
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

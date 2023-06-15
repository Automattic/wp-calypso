import './style.scss';
import {
	Button,
	Dialog,
	Gridicon,
	HorizontalBarList,
	HorizontalBarListItem,
} from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { __, sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment/moment';
import { useState } from 'react';
import Badge from 'calypso/components/badge';
import Breadcrumb, { Item } from 'calypso/components/breadcrumb';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import { CampaignResponse } from 'calypso/data/promote-post/use-promote-post-campaigns-query-new';
import useCancelCampaignMutation from 'calypso/data/promote-post/use-promote-post-cancel-campaign-mutation';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import AdPreview from 'calypso/my-sites/promote-post-i2/components/ad-preview';
import useOpenPromoteWidget from 'calypso/my-sites/promote-post-i2/hooks/use-open-promote-widget';
import {
	canCancelCampaign,
	getAdvertisingDashboardPath,
} from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	formatCents,
	formatNumber,
	getCampaignDurationFormatted,
	getCampaignEstimatedImpressions,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
} from '../../utils';

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

export default function CampaignItemDetails( props: Props ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const translate = useTranslate();
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ showErrorDialog, setShowErrorDialog ] = useState( false );
	const { cancelCampaign } = useCancelCampaignMutation( () => setShowErrorDialog( true ) );
	const isSmallScreen = useBreakpoint( '<660px' );
	const { campaign, isLoading, siteId } = props;
	const campaignId = campaign?.campaign_id;

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
		campaign_stats,
		billing_data,
		display_delivery_estimate = '',
		target_urn,
		delivery_percent,
	} = campaign || {};

	const {
		impressions_total = 0,
		clicks_total,
		clickthrough_rate,
		duration_days,
		total_budget_left,
		total_budget,
		total_budget_used,
		visits_total = 0,
		visits_organic,
	} = campaign_stats || {};

	const { card_name, payment_method, subtotal, credits, total } = billing_data || {};
	const { title, clickUrl } = content_config || {};

	const onClickPromote = useOpenPromoteWidget( {
		keyValue: `post-${ getPostIdFromURN( target_urn || '' ) }`, // + campaignId,
		entrypoint: 'promoted_posts-post_item',
	} );

	// Target block
	const devicesList = audience_list ? audience_list[ 'devices' ] : '';
	const countriesList = audience_list ? audience_list[ 'countries' ] : '';
	const topicsList = audience_list ? audience_list[ 'topics' ] : '';
	const OSsList = audience_list ? audience_list[ 'OSs' ] : '';

	// Formatted labels
	const ctrFormatted = clickthrough_rate ? `${ clickthrough_rate.toFixed( 2 ) }%` : '-';
	const durationFormatted = getCampaignDurationFormatted( start_date, end_date );
	const totalBudgetFormatted = `$${ formatCents( total_budget || 0 ) }`;
	const totalBudgetLeftFormatted = `$${ formatCents( total_budget_left || 0 ) } ${ __( 'left' ) }`;
	const overallSpendingFormatted = `$${ formatCents( total_budget_used || 0 ) }`;
	const deliveryEstimateFormatted = getCampaignEstimatedImpressions( display_delivery_estimate );
	const campaignTitleFormatted = title || __( 'Untitled' );
	const campaignCreatedFormatted = moment.utc( start_date ).format( 'MMMM DD, YYYY' );
	const devicesListFormatted = devicesList ? `${ devicesList }` : __( 'All' );
	const countriesListFormatted = countriesList ? `${ countriesList }` : __( 'Everywhere' );
	const osListFormatted = OSsList ? `${ OSsList }` : translate( 'All' );
	const topicsListFormatted = topicsList ? `${ topicsList }` : __( 'All' );
	const impressionsTotal = formatNumber( impressions_total );
	const subtotalFormatted = `$${ formatCents( subtotal || 0 ) }`;
	const creditsFormatted = `$${ formatCents( credits || 0 ) }`;
	const totalFormatted = `$${ formatCents( total || 0 ) }`;

	const navigationItems = [
		{
			label: translate( 'Advertising' ),
			href: getAdvertisingDashboardPath( `/${ selectedSiteSlug }/campaigns` ),
		},
		{
			label: campaignTitleFormatted || '',
			href: getAdvertisingDashboardPath( `${ selectedSiteSlug }/campaigns/${ campaignId }` ),
		},
	];

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

	const databars = [
		{
			label: translate( 'Ad' ),
			value: clicks_total || 0,
		},
		{
			label: translate( 'Organic' ),
			value: visits_organic || 0,
		},
	];

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
				cancelCampaign( siteId, campaignId );
			},
		},
	];

	const errorDialogButtons = [
		{
			action: 'remove',
			label: __( 'Contact support' ),
			onClick: async () => {
				setShowErrorDialog( false );
				window.open( 'https://wordpress.com/support/', '_blank' );
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
							<Breadcrumb items={ navigationItems as Item[] } compact={ isSmallScreen } />
						) : (
							<FlexibleSkeleton />
						) }
					</div>

					<div className="campaign-item-details__header-title">
						{ isLoading ? <FlexibleSkeleton /> : campaignTitleFormatted }
					</div>

					<div className="campaign-item__header-status">
						{ ! isLoading && status ? (
							<Badge type={ getCampaignStatusBadgeColor( status ) }>
								{ getCampaignStatus( status ) }
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
								<div className="campaign-item__header-status-date">
									{ translate( 'Created:' ) } { campaignCreatedFormatted }
								</div>
								<span>&bull;</span>
								<div className="campaign-item__header-status-date">
									{ translate( 'Author:' ) } { display_name }
								</div>
							</>
						) : (
							<FlexibleSkeleton />
						) }
					</div>
				</div>

				<div>
					{ ! isLoading && status === 'finished' && (
						<Button
							className="campaign-item-promote-again-button"
							primary
							onClick={ onClickPromote }
						>
							{ translate( 'Promote again' ) }
						</Button>
					) }
				</div>
			</header>
			<hr className="campaign-item-details-header-line" />
			<Main wideLayout className="campaign-item-details">
				{ status === 'rejected' && (
					<Notice
						isReskinned={ true }
						showDismiss={ false }
						status="is-error"
						icon="notice-outline"
						className="campaign-item-details__notice"
					>
						{ translate(
							'Your ad was not approved, please review our {{wpcomTos}}WordPress.com Terms{{/wpcomTos}} and {{advertisingTos}}Advertising Policy{{/advertisingTos}}.',
							{
								components: {
									wpcomTos: (
										<a
											href="https://wordpress.com/tos/"
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

				<section className="campaign-item-details__wrapper">
					<div className="campaign-item-details__main">
						<div className="campaign-item-details__main-stats-container">
							<div className="campaign-item-details__main-stats">
								<div className="campaign-item-details__main-stats-row">
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Impressions' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? impressionsTotal : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">{ translate( 'Clicks' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? clicks_total : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Click-through rate' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? ctrFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
								</div>
								<div className="campaign-item-details__main-stats-row">
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Duration' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? durationFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? (
												`${ duration_days } ${ translate( 'days' ) }`
											) : (
												<FlexibleSkeleton />
											) }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">{ translate( 'Budget' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? totalBudgetFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? totalBudgetLeftFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Overall spending ' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? overallSpendingFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="campaign-item-details__main-stats-container">
							<div className="campaign-item-details__secondary-stats">
								<div className="campaign-item-details__secondary-stats-row">
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Estimated impressions' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ ! isLoading ? deliveryEstimateFormatted : <FlexibleSkeleton /> }
										</span>
										{ ! isLoading && delivery_percent && delivery_percent > 100 ? (
											<span className="campaign-item-details__details">
												{ sprintf(
													/* translators: %s: percentage of delivery (i.e. 30%) */
													translate( 'Delivered %s more than estimated' ),
													`${ delivery_percent }%`
												) }
											</span>
										) : null }
									</div>
									<div>
										<div className="campaign-item-details__trafic-container-header">
											<span className="campaign-item-details__label">
												{ translate( 'Traffic breakdown' ) }
											</span>
											<span className="campaign-item-details__label">
												{ translate( 'Visits' ) }
											</span>
										</div>
										<div className="campaign-item-details__traffic-container-body">
											<ul className="horizontal-bar-list">
												{ ! isLoading ? (
													<HorizontalBarList>
														{ databars?.map( ( item, index ) => (
															<HorizontalBarListItem
																key={ `bar_${ index }` }
																data={ item }
																maxValue={ visits_total }
																hasIndicator={ false }
																leftSideItem={ null }
																useShortLabel={ false }
																useShortNumber={ true }
																isStatic={ true }
																usePlainCard={ false }
																isLinkUnderlined={ false }
																leftGroupToggle={ true }
															/>
														) ) }
													</HorizontalBarList>
												) : (
													<FlexibleSkeleton />
												) }
											</ul>
											<div className="campaign-item-details__details no-bottom-margin">
												{ translate( 'Compares traffic when campaign was active' ) }
											</div>
										</div>
									</div>
								</div>

								<div className="campaign-item-details__secondary-stats-row">
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Audience' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? devicesListFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__label">
											{ translate( 'Location' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? countriesListFormatted : <FlexibleSkeleton /> }
										</span>
										<span className="campaign-item-details__label">
											{ translate( 'Operating systems' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? osListFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ translate( 'Interests' ) }
										</span>
										<span className="campaign-item-details__details">
											{ ! isLoading ? topicsListFormatted : <FlexibleSkeleton /> }
										</span>
									</div>
								</div>
								<div className="campaign-item-details__secondary-stats-row">
									<div className="campaign-item-details__ad-destination">
										<span className="campaign-item-details__label">
											{ translate( 'Ad destination' ) }
										</span>
										<div className="campaign-item-details__ad-destination-url-container">
											{ ! isLoading ? (
												<Button
													className="campaign-item-details__ad-destination-url-link"
													href={ clickUrl }
													target="_blank"
												>
													{ clickUrl }
													<Gridicon icon="external" size={ 16 } />
												</Button>
											) : (
												<FlexibleSkeleton />
											) }
										</div>
									</div>
								</div>
							</div>
						</div>
						{ ( status === 'completed' || status === 'finished' ) && (
							<div className="campaign-item-details__payment-container">
								<div className="campaign-item-details__payment">
									<div className="campaign-item-details__payment-row">
										<div className="campaign-item-details__secondary-payment-row">
											<div>
												{ payment_method && card_name && (
													<>
														<span className="campaign-item-details__label">
															{ translate( 'Payment method' ) }
														</span>
														<span>{ card_name }</span>
														{ payment_method && <span>{ payment_method }</span> }
													</>
												) }
											</div>
											<div>
												{ subtotal ? (
													<span className="campaign-item-details__label">
														<div>{ translate( 'Subtotal' ) }</div>
														<div>{ subtotalFormatted }</div>
													</span>
												) : (
													[]
												) }
												{ credits ? (
													<span className="campaign-item-details__label">
														<div>{ translate( 'Credits' ) }</div>
														<div>{ creditsFormatted }</div>
													</span>
												) : (
													[]
												) }
												{ total ? (
													<span className="campaign-item-details__label">
														<div>{ translate( 'Total paid' ) }</div>
														<div>{ totalFormatted }</div>
													</span>
												) : (
													[]
												) }
											</div>
										</div>
									</div>
								</div>
							</div>
						) }
					</div>
					<div className="campaign-item-details__preview">
						<div className="campaign-item-details__preview-container">
							<div className="campaign-item-details__preview-header">
								<div className="campaign-item-details__preview-header-title">
									{ translate( 'Ad preview' ) }
								</div>
								<div className="campaign-item-details__preview-header-dimensions">
									{ ! isLoading ? (
										<>
											<span>{ `${ width }x${ height }` }</span>
										</>
									) : (
										<FlexibleSkeleton />
									) }
								</div>
							</div>
							{ isSmallScreen && <hr className="campaign-item-ad-header-line" /> }
							<div className="campaign-item-details__preview-content">
								<AdPreview isLoading={ isLoading } htmlCode={ creative_html || '' } />
							</div>
						</div>

						<div className="campaign-item-details__support-buttons-container">
							<div className="campaign-item-details__support-buttons">
								{ ! isLoading && status ? (
									<>
										{ canCancelCampaign( status ) && (
											<Button scary onClick={ () => setShowDeleteDialog( true ) }>
												{ cancelCampaignButtonText }
											</Button>
										) }
										<Button href={ CALYPSO_CONTACT } target="_blank">
											{ icon }
											{ translate( 'Contact Support' ) }
										</Button>
									</>
								) : (
									<FlexibleSkeleton />
								) }
							</div>
							<div className="campaign-item-details__support-articles-wrapper">
								<div className="campaign-item-details__support-heading">
									{ translate( 'Support articles' ) }
								</div>
								<Button className="is-link campaign-item-details__support-effective-ad-doc">
									{ translate( 'What makes an effective ad?' ) }
									<Gridicon icon="external" size={ 16 } />
								</Button>

								<InlineSupportLink
									className="is-link components-button campaign-item-details__support-link"
									supportContext="advertising"
									showIcon={ false }
								>
									{ translate( 'View documentation' ) }
									<Gridicon icon="external" size={ 16 } />
								</InlineSupportLink>
								<div className="campaign-item-details__powered-by">
									<Gridicon icon="fire" size={ 16 } />
									<span>{ translate( 'Powered by Blaze' ) }</span>
								</div>
							</div>
						</div>
					</div>
				</section>
			</Main>
		</div>
	);
}

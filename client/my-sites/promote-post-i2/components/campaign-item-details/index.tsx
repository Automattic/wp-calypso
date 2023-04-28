// import { Campaign } from "calypso/data/promote-post/use-promote-post-campaigns-query";
import './style.scss';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment/moment';
import { useMemo } from 'react';
import Badge from 'calypso/components/badge';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import AdPreview from 'calypso/my-sites/promote-post/components/ad-preview';
import {
	formatNumber,
	formatCents,
	getCampaignBudgetData,
	getCampaignDurationFormatted,
	getCampaignOverallSpending,
	getCampaignStatus,
	getCampaignStatusBadgeColor,
	normalizeCampaignStatus,
	getCampaignClickthroughRate,
	getCampaignDurationDays,
	getCampaignEstimatedImpressions,
} from '../../utils';
// TODO remove this file and use the api to fetch the data
import campaignData from './mockData.json';
// interface Props {
// 	campaign: Campaign;
// }

export default function CampaignItemDetails() {
	// const { campaign } = props;
	//
	const {
		// 	campaign_id,
		// 	name,
		content_config,
		// 	display_name,
		// 	status,
		end_date,
		budget_cents,
		impressions_total,
		clicks_total,
		clicks_organic,
		spent_budget_cents,
		start_date,
		display_name,
		creative_html,
		width,
		height,
		display_delivery_estimate,
		audience_list,
	} = campaignData;
	// const { totalBudget, totalBudgetLeft, campaignDays } = useMemo(
	// 	() => getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents ),
	// 	[ budget_cents, end_date, spent_budget_cents, start_date ]
	// );

	const translate = useTranslate();

	const campaignStatus = useMemo( () => normalizeCampaignStatus( campaignData ), [ campaignData ] );

	const clickthroughRate = useMemo(
		() => getCampaignClickthroughRate( clicks_total || 0, impressions_total || 0 ),
		[ clicks_total, impressions_total ]
	);

	const durationFormatted = useMemo(
		() => getCampaignDurationFormatted( start_date, end_date ),
		[ start_date, end_date ]
	);

	const durationDaysFormatted = useMemo(
		() => getCampaignDurationDays( start_date, end_date ),
		[ start_date, end_date ]
	);

	const { totalBudget, totalBudgetLeft, campaignDays } = useMemo(
		() => getCampaignBudgetData( budget_cents, start_date, end_date, spent_budget_cents ),
		[ budget_cents, end_date, spent_budget_cents, start_date ]
	);

	const totalBudgetLeftString = `$${ formatCents( totalBudgetLeft || 0 ) } ${ __( 'left' ) }`;

	const budgetString = campaignDays ? `$${ totalBudget }` : '-';

	const overallSpending = useMemo(
		() => getCampaignOverallSpending( spent_budget_cents, budget_cents, start_date, end_date ),
		[ spent_budget_cents, budget_cents, start_date, end_date ]
	);

	const estimatedImpressions = useMemo(
		() => getCampaignEstimatedImpressions( display_delivery_estimate ),
		[ display_delivery_estimate ]
	);

	const totalClicks = clicks_total + clicks_organic;

	const organicClicksPercentage = ( ( clicks_organic * 100 ) / totalClicks ).toFixed( 2 );
	const adClicksPercentage = ( ( clicks_total * 100 ) / totalClicks ).toFixed( 2 );

	const audienceList = audience_list;
	const devicesList = audienceList[ 'devices' ] || '';
	const countriesList = audienceList[ 'countries' ] || '';
	const topicsList = audienceList[ 'topics' ] || '';
	const OSsList = audienceList[ 'OSs' ] || '';

	const icon = (
		<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M8 16.3193C12.4183 16.3193 16 12.7376 16 8.31934C16 3.90106 12.4183 0.319336 8 0.319336C3.58172 0.319336 0 3.90106 0 8.31934C0 12.7376 3.58172 16.3193 8 16.3193ZM13.375 11.9755C14.085 10.9338 14.5 9.67502 14.5 8.31934C14.5 7.08407 14.1554 5.92928 13.5571 4.94585L12.2953 5.75845C12.7428 6.50748 13 7.38337 13 8.31934C13 9.37572 12.6724 10.3556 12.1132 11.1629L13.375 11.9755ZM11.4245 13.8451L10.6121 12.5836C9.85194 13.0503 8.95739 13.3193 8 13.3193C7.04263 13.3193 6.1481 13.0503 5.38791 12.5836L4.57552 13.8451C5.56993 14.4627 6.74332 14.8193 8 14.8193C9.2567 14.8193 10.4301 14.4627 11.4245 13.8451ZM2.62498 11.9755C1.91504 10.9338 1.5 9.67503 1.5 8.31934C1.5 7.08405 1.84458 5.92926 2.44287 4.94582L3.70473 5.75842C3.25718 6.50745 3 7.38336 3 8.31934C3 9.37573 3.32761 10.3556 3.88678 11.1629L2.62498 11.9755ZM5.20588 4.17229C6.00361 3.63376 6.96508 3.31934 8 3.31934C9.03494 3.31934 9.99643 3.63377 10.7942 4.17232L11.6065 2.91084C10.5746 2.22134 9.33424 1.81934 8 1.81934C6.66578 1.81934 5.42544 2.22133 4.39351 2.91081L5.20588 4.17229ZM8 11.8193C9.933 11.8193 11.5 10.2523 11.5 8.31934C11.5 6.38634 9.933 4.81934 8 4.81934C6.067 4.81934 4.5 6.38634 4.5 8.31934C4.5 10.2523 6.067 11.8193 8 11.8193Z"
				fill="#1E1E1E"
			/>
		</svg>
	);

	return (
		<div className="campaign-item__container">
			<header className="main is-wide-layout campaign-item-header">
				<div className="campaign-item-details__header-title">
					{ content_config.title || __( 'Untitled' ) }
				</div>

				<div className="campaign-item__header-status">
					<Badge type={ getCampaignStatusBadgeColor( campaignStatus ) }>
						{ getCampaignStatus( campaignStatus ) }
					</Badge>
					<span>&bull;</span>
					<div className="campaign-item__header-status-date">
						{ __( 'Created:' ) } { moment.utc( start_date ).format( 'MMMM DD, YYYY' ) }
					</div>
					<span>&bull;</span>
					<div className="campaign-item__header-status-date">
						{ __( 'Author:' ) } { display_name }
					</div>
				</div>
			</header>
			<hr className="campaign-item-details-header-line" />
			<Main wideLayout className="campaign-item-details">
				<section className="campaign-item-details">
					<div className="campaign-item-details__main">
						<div className="campaign-item-details__main-stats-container">
							<div className="campaign-item-details__main-stats">
								<div className="campaign-item-details__main-stats-row">
									<div>
										<span className="campaign-item-details__label">{ __( 'Impressions' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ formatNumber( impressions_total ) }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">{ __( 'Clicks' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ formatNumber( clicks_total ) }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ __( 'Click-through rate' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ clickthroughRate }%
										</span>
									</div>
								</div>
								<div className="campaign-item-details__main-stats-row">
									<div>
										<span className="campaign-item-details__label">{ __( 'Duration' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ durationFormatted }
										</span>
										<span className="campaign-item-details__details">
											{ `${ durationDaysFormatted } ${ __( 'days' ) }` }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">{ __( 'Budget' ) }</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ budgetString }
										</span>
										<span className="campaign-item-details__details">
											{ totalBudgetLeftString }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">
											{ __( 'Overall spending ' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ overallSpending }
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
											{ __( 'Estimated impressions' ) }
										</span>
										<span className="campaign-item-details__text wp-brand-font">
											{ estimatedImpressions }
										</span>
										<span className="campaign-item-details__details">
											{ /* // TODO hardcoded value */ }
											{ __( 'Delivered 192% more than estimated' ) }
										</span>
									</div>
									<div>
										<div className="campaign-item-details__trafic-container-header">
											<span className="campaign-item-details__label">
												{ __( 'Traffic breakdown' ) }
											</span>
											<span className="campaign-item-details__label">{ __( 'Visits' ) }</span>
										</div>
										<div className="campaign-item-details__traffic-container-body">
											<ul className="horizontal-bar-list">
												<li
													className="horizontal-bar-list-item"
													style={ { '--horizontal-bar-list-fill': `${ adClicksPercentage }%` } }
												>
													<div className="horizontal-bar-list-item-bar">
														<span className="horizontal-bar-list-label">{ __( 'Ad' ) }</span>
													</div>
													<div className="horizontal-bar-list-value">
														{ formatNumber( clicks_total ) }
													</div>
												</li>
												<li
													className="horizontal-bar-list-item"
													style={ {
														'--horizontal-bar-list-fill': `${ organicClicksPercentage }%`,
													} }
												>
													<div className="horizontal-bar-list-item-bar">
														<span className="horizontal-bar-list-label">{ __( 'Organic' ) }</span>
													</div>
													<div className="horizontal-bar-list-value">
														{ formatNumber( clicks_organic ) }
													</div>
												</li>
											</ul>
											<div className="campaign-item-details__details no-bottom-margin">
												{ __( 'Compares traffic during the campaign' ) }
											</div>
										</div>
									</div>
								</div>

								<div className="campaign-item-details__secondary-stats-row">
									<div>
										<span className="campaign-item-details__label">{ __( 'Devices' ) }</span>
										<span className="campaign-item-details__details">
											{ devicesList ? `${ devicesList }` : '-' }
										</span>
										<span className="campaign-item-details__label">{ __( 'Location' ) }</span>
										<span className="campaign-item-details__details">
											{ countriesList ? `${ countriesList }` : '-' }
										</span>
										<span className="campaign-item-details__label">
											{ __( 'Operating systems' ) }
										</span>
										<span className="campaign-item-details__details">
											{ OSsList ? `${ OSsList }` : translate( 'All' ) }
										</span>
									</div>
									<div>
										<span className="campaign-item-details__label">{ __( 'Interests' ) }</span>
										<span className="campaign-item-details__details">
											{ topicsList ? `${ topicsList }` : '-' }
										</span>
									</div>
								</div>
								<div className="campaign-item-details__secondary-stats-row">
									<div className="campaign-item-details__ad-destination">
										<span className="campaign-item-details__label">{ __( 'Ad destination' ) }</span>
										<div className="campaign-item-details__ad-destination-url-container">
											<Button
												className="campaign-item-details__ad-destination-url-link"
												href={ content_config.clickUrl }
												target="_blank"
											>
												{ content_config.clickUrl }
												<Gridicon icon="external" size={ 16 } />
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="campaign-item-details__preview">
						<div className="campaign-item-details__preview-container">
							<div className="campaign-item-details__preview-header">
								<div className="campaign-item-details__preview-header-title">
									{ __( 'Ad preview' ) }
								</div>
								<div className="campaign-item-details__preview-header-dimensions">
									<span>{ `${ width }x${ height }` }</span>
									<Gridicon
										className="campaign-item-details__notice-icon"
										size={ 16 }
										icon="info-outline"
									/>
								</div>
							</div>
							<div className="campaign-item-details__preview-content">
								<AdPreview htmlCode={ creative_html } />
							</div>
						</div>

						<div className="campaign-item-details__support-buttons-container">
							<Button
								className="campaign-item-details__support-button"
								isSecondary
								icon={ icon }
								iconSize={ 16 }
								href={ CALYPSO_CONTACT }
								target="_blank"
							>
								{ __( 'Contact Support' ) }
							</Button>
							<div className="campaign-item-details__support-heading">
								{ __( 'Support articles' ) }
							</div>
							<Button className="is-link">
								{ __( 'What makes an effective ad?' ) }
								<Gridicon icon="external" size={ 16 } />
							</Button>

							<InlineSupportLink
								className="is-link components-button"
								supportContext="advertising"
								showIcon={ false }
							>
								{ __( 'View documentation' ) }
								<Gridicon icon="external" size={ 16 } />
							</InlineSupportLink>
							<div className="campaign-item-details__powered-by">
								<Gridicon icon="fire" size={ 16 } />
								<span>{ __( 'Powered by Blaze' ) }</span>
							</div>
						</div>
					</div>
				</section>
			</Main>
		</div>
	);
}

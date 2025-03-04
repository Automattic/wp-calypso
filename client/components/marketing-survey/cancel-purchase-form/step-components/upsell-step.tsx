import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, PLAN_PERSONAL, PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useOpenZendeskMessaging } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useTranslate, numberFormat, formatCurrency } from 'i18n-calypso';
import { useState } from 'react';
import imgBuiltBy from 'calypso/assets/images/cancellation/built-by.png';
import imgBusinessPlan from 'calypso/assets/images/cancellation/business-plan.png';
import imgFreeMonth from 'calypso/assets/images/cancellation/free-month.png';
import imgLiveChat from 'calypso/assets/images/cancellation/live-chat.png';
import imgMonthlyPayments from 'calypso/assets/images/cancellation/monthly-payments.png';
import imgSwitchPlan from 'calypso/assets/images/cancellation/switch-plan.png';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { UpsellType } from '../get-upsell-type';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

type UpsellProps = {
	children?: React.ReactNode;
	image: string;
	title: TranslateResult;
	acceptButtonText: TranslateResult;
	acceptButtonUrl?: string;
	declineButtonText?: TranslateResult;
	onAccept?: () => void;
	onDecline: () => void;
};

function Upsell( { image, ...props }: UpsellProps ) {
	const translate = useTranslate();
	const declineButtonText = props.declineButtonText || translate( 'Cancel my current plan' );
	const [ busyButton, setBusyButton ] = useState( '' );

	return (
		<div className="cancel-purchase-form__upsell">
			<div className="cancel-purchase-form__upsell-content">
				<div className="cancel-purchase-form__upsell-subheader">
					{ translate( 'Here is an idea' ) }
				</div>
				<FormattedHeader brandFont headerText={ props.title } />
				<div className="cancel-purchase-form__upsell-text">{ props.children }</div>
				<div className="cancel-purchase-form__upsell-buttons">
					<Button
						variant="primary"
						href={ props.acceptButtonUrl }
						onClick={ () => {
							setBusyButton( 'accept' );
							props.onAccept?.();
						} }
						isBusy={ busyButton === 'accept' }
					>
						{ props.acceptButtonText }
					</Button>
					<Button
						variant="primary"
						onClick={ () => {
							setBusyButton( 'decline' );
							props.onDecline?.();
						} }
						isBusy={ busyButton === 'decline' }
						disabled={ Boolean( busyButton && busyButton !== 'decline' ) }
					>
						{ declineButtonText }
					</Button>
				</div>
			</div>
			<div className="cancel-purchase-form__upsell-image-container">
				<img className="cancel-purchase-form__upsell-image" src={ image } alt="" />
			</div>
		</div>
	);
}

function getLiveChatUrl( type: UpsellType, site: SiteDetails, purchase: Purchase ) {
	switch ( type ) {
		case 'live-chat:plans':
			return `/purchases/subscriptions/${ site.slug }/${ purchase.id }`;
		case 'live-chat:plugins':
			return `/plugins/${ site.slug }`;
		case 'live-chat:themes':
			return `/themes/${ site.slug }`;
		case 'live-chat:domains':
			return `/domains/manage/${ site.slug }`;
	}

	return '';
}

type StepProps = {
	upsell: UpsellType;
	site: SiteDetails;
	purchase: Purchase;
	refundAmount: string;
	downgradePlanPrice: number | null;
	closeDialog: () => void;
	cancelBundledDomain: boolean;
	includedDomainPurchase: object;
	onDeclineUpsell: () => void;
	onClickFreeMonthOffer?: () => void;
	onClickDowngrade?: ( upsell: string ) => void;
	cancellationReason: string;
};

export default function UpsellStep( { upsell, site, purchase, ...props }: StepProps ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';
	const numberOfPluginsThemes = numberFormat( 50000 );
	const discountRate = 25;
	const couponCode = 'BIZWPC25';
	const builtByURL = 'https://wordpress.com/website-design-service/?ref=wpcom-cancel-flow';
	const { refundAmount } = props;
	const { openZendeskWidget } = useOpenZendeskMessaging( 'pre-cancellation-upsell' );
	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';

	switch ( upsell ) {
		case 'live-chat:plans':
		case 'live-chat:plugins':
		case 'live-chat:themes':
		case 'live-chat:domains':
			return (
				<Upsell
					title={
						hasEnTranslation( 'Connect with our Happiness Engineers' )
							? translate( 'Connect with our Happiness Engineers' )
							: translate( 'Chat with a real person right now' )
					}
					acceptButtonText={
						hasEnTranslation( 'Connect with a Happiness Engineer' )
							? translate( 'Connect with a Happiness Engineer' )
							: translate( 'Let’s have a chat' )
					}
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upsell_step_live_chat_click', {
							type: upsell,
						} );
						page( getLiveChatUrl( upsell, site, purchase ) );

						openZendeskWidget( {
							message:
								"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
								props.cancellationReason,
							siteUrl: site.URL,
							siteId: site.ID,
						} );
						props.closeDialog();
					} }
					onDecline={ props.onDeclineUpsell }
					image={ imgLiveChat }
				>
					{ hasEnTranslation(
						'If you’re feeling a bit stuck with your site, our expert {{b}}Happiness Engineers{{/b}} are always ready to help. ' +
							'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.'
					)
						? translate(
								'If you’re feeling a bit stuck with your site, our expert {{b}}Happiness Engineers{{/b}} are always ready to help. ' +
									'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.',
								{
									components: { b: <strong /> },
								}
						  )
						: translate(
								'If you’re feeling a bit stuck with your site, our expert {{b}}Happiness Engineers{{/b}} are always ready to chat. ' +
									'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.',
								{
									components: { b: <strong /> },
								}
						  ) }
				</Upsell>
			);
		case 'built-by':
			return (
				<Upsell
					title={ translate( 'Let us build your site for you' ) }
					acceptButtonText={ translate( 'Get help building my site' ) }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upsell_step_buily_by_click' );
						window.location.replace( builtByURL );
					} }
					onDecline={ props.onDeclineUpsell }
					image={ imgBuiltBy }
				>
					{ translate(
						'Building a website from scratch can be a lot of work. ' +
							'Our professional website design service can help you skip to a beautiful, finished website without all the hassle. ' +
							'No matter what you need - whether it’s a custom design or just a redesign - our pro design team can make it happen.'
					) }
				</Upsell>
			);
		case 'upgrade-atomic':
			return (
				<Upsell
					title={ translate( 'Go further with %(numberOfPluginsThemes)s plugins and themes', {
						args: { numberOfPluginsThemes },
					} ) }
					acceptButtonText={ translate( 'I want the %(businessPlanName)s plan', {
						args: { businessPlanName },
					} ) }
					acceptButtonUrl={ `/checkout/${ site.slug }/business?coupon=${ couponCode }` }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' );
					} }
					onDecline={ props.onDeclineUpsell }
					image={ imgBusinessPlan }
				>
					{
						/* translators: %(discountRate)d%% is a discount percentage like 20% or 25%, followed by an escaped percentage sign %% */
						translate(
							'Did you know that you can now use over %(numberOfPluginsThemes)s third-party plugins and themes on the WordPress.com %(businessPlanName)s plan? ' +
								'Whatever feature or design you want to add to your site, you’ll find a plugin or theme to get you there. ' +
								'Claim a %(discountRate)d%% discount when you renew your %(businessPlanName)s plan today – {{b}}just enter the code %(couponCode)s at checkout.{{/b}}',
							{
								args: {
									numberOfPluginsThemes,
									discountRate,
									couponCode,
									businessPlanName,
								},
								components: { b: <strong /> },
							}
						)
					}
				</Upsell>
			);
		case 'downgrade-monthly':
			return (
				<Upsell
					title={ translate( 'Switch to flexible monthly payments' ) }
					acceptButtonText={ translate( 'Switch to monthly payments' ) }
					onAccept={ () => props.onClickDowngrade?.( upsell ) }
					onDecline={ props.onDeclineUpsell }
					image={ imgMonthlyPayments }
				>
					<>
						{ translate(
							'By switching to monthly payments, you will keep most of the features for %(planCost)s per month.',
							{
								args: {
									planCost: formatCurrency( props.downgradePlanPrice ?? 0, currencyCode, {
										isSmallestUnit: true,
									} ),
								},
							}
						) }{ ' ' }
						{ props.cancelBundledDomain &&
							props.includedDomainPurchase &&
							translate(
								'You will lose your free domain registration since that feature is only included in annual/biannual plans.'
							) }
						{ refundAmount && <br /> }
						{ Number( refundAmount )
							? translate(
									'You can downgrade immediately and get a partial refund of %(refundAmount)s.',
									{
										args: {
											refundAmount: formatCurrency( parseFloat( refundAmount ), currencyCode ),
										},
									}
							  )
							: null }
					</>
				</Upsell>
			);
		case 'downgrade-personal':
			return (
				<Upsell
					title={ translate( 'Switch to a more affordable plan' ) }
					/* translators: %(plan)s is WordPress.com Personal or another plan */
					acceptButtonText={ translate( 'Switch to the %(plan)s plan', {
						args: { plan: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
					} ) }
					onAccept={ () => props.onClickDowngrade?.( upsell ) }
					onDecline={ props.onDeclineUpsell }
					image={ imgSwitchPlan }
				>
					<>
						{ hasEnTranslation(
							'%(plan)s still gives you access to fast support, removal of ads, and more — and for 50% of the cost of your current plan.'
						)
							? translate(
									'%(plan)s still gives you access to fast support, removal of ads, and more — and for 50% of the cost of your current plan.',
									{
										args: { plan: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
										comment: '%(plan)s is WordPress.com Personal or another plan',
									}
							  )
							: translate(
									'%(plan)s still gives you access to customer support via email, removal of ads, and more — and for 50% of the cost of your current plan.',
									{
										args: { plan: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
									}
							  ) }{ ' ' }
						{ refundAmount &&
							translate(
								'You can downgrade and get a partial refund of %(amount)s or ' +
									'continue to the next step and cancel the plan.',
								{
									args: {
										amount: formatCurrency( parseFloat( refundAmount ), currencyCode ),
									},
								}
							) }
					</>
				</Upsell>
			);
		case 'free-month-offer':
			return (
				<Upsell
					title={ translate( 'How about a free month?' ) }
					acceptButtonText={ translate( 'Get a free month' ) }
					onAccept={ () => props.onClickFreeMonthOffer?.() }
					onDecline={ props.onDeclineUpsell }
					image={ imgFreeMonth }
				>
					{ translate(
						'We get it – building a site takes time. ' +
							'But we’d love to see you stick around to build on what you started. ' +
							'How about a free month of your %(currentPlan)s plan subscription to continue building your site?',
						{
							args: { planName: getPlan( purchase.productSlug )?.getTitle() ?? '' },
						}
					) }
				</Upsell>
			);
	}

	return null;
}

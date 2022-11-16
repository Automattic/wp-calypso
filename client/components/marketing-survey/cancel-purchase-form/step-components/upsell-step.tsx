import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import imgBuiltBy from 'calypso/assets/images/cancellation/built-by.png';
import imgBusinessPlan from 'calypso/assets/images/cancellation/business-plan.png';
import imgFreeMonth from 'calypso/assets/images/cancellation/free-month.png';
import imgLiveChat from 'calypso/assets/images/cancellation/live-chat.png';
import imgMonthlyPayments from 'calypso/assets/images/cancellation/monthly-payments.png';
import imgSwitchPlan from 'calypso/assets/images/cancellation/switch-plan.png';
import FormattedHeader from 'calypso/components/formatted-header';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { UpsellType } from '../get-upsell-type';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

type UpsellProps = {
	children: React.ReactChild;
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
						isPrimary
						onClick={ () => {
							setBusyButton( 'accept' );
							props.onAccept?.();
						} }
						isBusy={ busyButton === 'accept' }
						disabled={ Boolean( busyButton && busyButton !== 'accept' ) }
					>
						{ props.acceptButtonText }
					</Button>
					<Button
						isSecondary
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

type StepProps = {
	upsell: UpsellType;
	site: SiteDetails;
	purchase: Purchase;
	refundAmount: string;
	downgradePlanPrice: number | null;
	cancelBundledDomain: boolean;
	includedDomainPurchase: object;
	onDeclineUpsell: () => void;
	onClickFreeMonthOffer?: () => void;
	onClickDowngrade?: ( upsell: string ) => void;
};

export default function UpsellStep( { upsell, site, purchase, ...props }: StepProps ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';
	const numberOfPluginsThemes = numberFormat( 50000, 0 );
	const discountRate = '25%';
	const couponCode = 'BIZC25';

	switch ( upsell ) {
		case 'live-chat:plans':
		case 'live-chat:plugins':
		case 'live-chat:themes':
		case 'live-chat:domains':
			return (
				<Upsell
					title={ translate( 'Chat with a real person right now' ) }
					acceptButtonText={ translate( 'Let’s have a chat' ) }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upsell_step_live_chat_click', {
							type: upsell,
						} );
					} }
					onDecline={ props.onDeclineUpsell }
					image={ imgLiveChat }
				>
					{ translate(
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
					} }
					acceptButtonUrl="https://builtbywp.com/get-started/"
					onDecline={ props.onDeclineUpsell }
					image={ imgBuiltBy }
				>
					{ translate(
						'Building a website from scratch can be a lot of work. ' +
							'Our professional website design service, {{b}}Built by WordPress.com{{/b}}, can help you skip to a beautiful, finished website without all the hassle. ' +
							'No matter what you need - whether it’s a custom design or just a redesign - our pro design team can make it happen.',
						{
							components: { b: <strong /> },
						}
					) }
				</Upsell>
			);
		case 'upgrade-atomic':
			return (
				<Upsell
					title={ translate( 'Go further with %(numberOfPluginsThemes)s plugins and themes', {
						args: { numberOfPluginsThemes },
					} ) }
					acceptButtonText={ translate( 'I want the Business plan' ) }
					acceptButtonUrl={ `/checkout/${ site.slug }/business?coupon=${ couponCode }` }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' );
					} }
					onDecline={ props.onDeclineUpsell }
					image={ imgBusinessPlan }
				>
					{ translate(
						'Did you know that you can now use over %(numberOfPluginsThemes)s third-party plugins and themes on the WordPress.com Business plan? ' +
							'Whatever feature or design you want to add to your site, you’ll find a plugin or theme to get you there. ' +
							'Claim a %(discountRate)s discount when you renew your Business plan today – {{b}}just enter the code %(couponCode)s at checkout.{{/b}}',
						{
							args: { numberOfPluginsThemes, discountRate, couponCode },
							components: { b: <strong /> },
						}
					) }
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
									planCost: formatCurrency( props.downgradePlanPrice ?? 0, currencyCode ),
								},
							}
						) }{ ' ' }
						{ props.cancelBundledDomain &&
							props.includedDomainPurchase &&
							translate(
								'You will lose your free domain registration since that feature is only included in annual/biennual plans.'
							) }
						{ props.refundAmount && <br /> }
						{ props.refundAmount &&
							translate(
								'You can downgrade immediately and get a partial refund of %(refundAmount)s.',
								{
									args: {
										refundAmount: formatCurrency( parseFloat( props.refundAmount ), currencyCode ),
									},
								}
							) }
					</>
				</Upsell>
			);
		case 'downgrade-personal':
			return (
				<Upsell
					title={ translate( 'Switch to a more affordable plan' ) }
					acceptButtonText={ translate( 'Switch to the Personal plan' ) }
					onAccept={ () => props.onClickDowngrade?.( upsell ) }
					onDecline={ props.onDeclineUpsell }
					image={ imgSwitchPlan }
				>
					{ translate(
						'We get it – building a site takes time. ' +
							'But we’d love to see you stick around to build on what you started. ' +
							'How about a free month of your %(currentPlan)s plan subscription to continue building your site?',
						{
							args: { currentPlan: 'CURRENT PLAN' },
						}
					) }
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
							args: { planName: getPlan( purchase.productSlug )?.getTitle() },
						}
					) }
				</Upsell>
			);
	}

	return null;
}

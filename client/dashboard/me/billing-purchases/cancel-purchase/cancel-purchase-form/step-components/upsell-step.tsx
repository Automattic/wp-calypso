import { useHasEnTranslation } from '@automattic/i18n-utils';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import * as React from 'react';
import imgBuiltBy from 'calypso/assets/images/cancellation/built-by.png';
import imgBusinessPlan from 'calypso/assets/images/cancellation/business-plan.png';
import imgFreeMonth from 'calypso/assets/images/cancellation/free-month.png';
import imgLiveChat from 'calypso/assets/images/cancellation/live-chat.png';
import imgMonthlyPayments from 'calypso/assets/images/cancellation/monthly-payments.png';
import imgSwitchPlan from 'calypso/assets/images/cancellation/switch-plan.png';
import { useAnalytics } from '../../../../../app/analytics';
import { useHelpCenter } from '../../../../../app/help-center';
import type { PlanProduct, Purchase } from '@automattic/api-core';

type UpsellProps = {
	children?: React.ReactNode;
	image: string;
	title: string;
	acceptButtonText: string;
	acceptButtonUrl?: string;
	onAccept?: () => void;
	onDecline?: () => void;
	isBusy?: boolean;
};

function Upsell( { image, ...props }: UpsellProps ) {
	const declineButtonText = __( 'Cancel my current plan' );

	return (
		<VStack>
			<div className="cancel-purchase-form__upsell-content">
				<div className="cancel-purchase-form__upsell-subheader">{ __( 'Here is an idea' ) }</div>
				<Heading>{ props.title }</Heading>
				<div className="cancel-purchase-form__upsell-text">{ props.children }</div>
				<div className="cancel-purchase-form__upsell-buttons">
					<Button
						variant="primary"
						href={ props.acceptButtonUrl }
						onClick={ props.onAccept }
						isBusy={ props.isBusy }
					>
						{ props.acceptButtonText }
					</Button>
					<Button variant="secondary" onClick={ props.onDecline } disabled={ props.isBusy }>
						{ declineButtonText }
					</Button>
				</div>
			</div>
			<div>
				<img className="cancel-purchase-form__upsell-image" src={ image } alt="" />
			</div>
		</VStack>
	);
}

function getLiveChatUrl( type: string, purchase: Purchase ) {
	switch ( type ) {
		case 'live-chat:plans':
			return `/purchases/subscriptions/${ purchase.site_slug }/${ purchase.ID }`;
		case 'live-chat:plugins':
			return `/plugins/${ purchase.site_slug }`;
		case 'live-chat:themes':
			return `/themes/${ purchase.site_slug }`;
		case 'live-chat:domains':
			return `/domains/manage/${ purchase.site_slug }`;
	}

	return '';
}

type StepProps = {
	cancelBundledDomain?: boolean;
	cancellationReason?: string;
	cancellationInProgress?: boolean;
	closeDialog?: () => void;
	currencyCode: string;
	downgradePlanPrice?: number | null;
	includedDomainPurchase?: object;
	onClickDowngrade?: ( upsell: string ) => void;
	onClickFreeMonthOffer?: () => void;
	onDeclineUpsell?: () => void;
	plans: PlanProduct[];
	purchase: Purchase;
	refundAmount?: number;
	upsell: string;
};

export default function UpsellStep( {
	upsell,
	purchase,
	currencyCode,
	cancellationInProgress,
	plans,
	...props
}: StepProps ) {
	const hasEnTranslation = useHasEnTranslation();
	const numberOfPluginsThemes = formatNumber( 50000 );
	const discountRate = 25;
	const couponCode = 'BIZWPC25';
	const builtByURL = 'https://wordpress.com/website-design-service/?ref=wpcom-cancel-flow';
	const { refundAmount } = props;
	const { setSubject, setShowHelpCenter } = useHelpCenter();
	const businessPlan = plans?.find( ( plan ) => 'business-bundle' === plan.product_slug );
	const businessPlanName = businessPlan?.product_name;
	const personalPlan = plans?.find( ( plan ) => 'personal-bundle' === plan.product_slug );
	const personalPlanName = personalPlan?.product_name ?? '';
	const thePlan = plans?.find( ( plan ) => purchase.product_slug === plan.product_slug );
	const planName = thePlan?.product_name ?? '';

	const { recordTracksEvent } = useAnalytics();

	switch ( upsell ) {
		case 'live-chat:plans':
		case 'live-chat:plugins':
		case 'live-chat:themes':
		case 'live-chat:domains':
			return (
				<Upsell
					title={
						hasEnTranslation( 'Connect with our Happiness Engineers' )
							? __( 'Connect with our Happiness Engineers' )
							: __( 'Chat with a real person right now' )
					}
					acceptButtonText={
						hasEnTranslation( 'Connect with a Happiness Engineer' )
							? __( 'Connect with a Happiness Engineer' )
							: __( 'Let’s have a chat' )
					}
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upsell_step_live_chat_click', {
							type: upsell,
						} );
						window.location.href = getLiveChatUrl( upsell, purchase );
						const initialMessage =
							"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
							props.cancellationReason;
						setSubject( initialMessage );
						setShowHelpCenter( true );

						props.closeDialog && props.closeDialog();
					} }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgLiveChat }
				>
					{ hasEnTranslation(
						'If you’re feeling a bit stuck with your site, our expert <b>Happiness Engineers</b> are always ready to help. ' +
							'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.'
					)
						? createInterpolateElement(
								__(
									'If you’re feeling a bit stuck with your site, our expert <b>Happiness Engineers</b> are always ready to help. ' +
										'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.'
								),
								{
									b: <strong />,
								}
						  )
						: createInterpolateElement(
								__(
									'If you’re feeling a bit stuck with your site, our expert <b>Happiness Engineers</b> are always ready to chat. ' +
										'Whatever you’re struggling with - from customizing your design to sorting out your domain - they’ll listen, guide you, and get you the advice you need to make it happen.'
								),
								{
									b: <strong />,
								}
						  ) }
				</Upsell>
			);
		case 'built-by':
			return (
				<Upsell
					title={ __( 'Let us build your site for you' ) }
					acceptButtonText={ __( 'Get help building my site' ) }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upsell_step_buily_by_click' );
						window.location.replace( builtByURL );
					} }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgBuiltBy }
				>
					{ __(
						'Building a website from scratch can be a lot of work. ' +
							'Our professional website design service can help you skip to a beautiful, finished website without all the hassle. ' +
							'No matter what you need - whether it’s a custom design or just a redesign - our pro design team can make it happen.'
					) }
				</Upsell>
			);
		case 'upgrade-atomic':
			return (
				<Upsell
					/* translators: %(numberOfPluginsThemes)s is number representing the count of plugins and themes */
					title={ sprintf( __( 'Go further with %(numberOfPluginsThemes)s plugins and themes' ), {
						numberOfPluginsThemes,
					} ) }
					/* translators: %(businessPlanName)s is the name of the business plan */
					acceptButtonText={ sprintf( __( 'I want the %(businessPlanName)s plan' ), {
						businessPlanName,
					} ) }
					acceptButtonUrl={ `/checkout/${ purchase.site_slug }/business?coupon=${ couponCode }` }
					onAccept={ () => {
						recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' );
					} }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgBusinessPlan }
				>
					{ createInterpolateElement(
						sprintf(
							/* translators: %(discountRate)d%% is a discount percentage like 20% or 25%, followed by an escaped percentage sign %% */
							__(
								'Did you know that you can now use over %(numberOfPluginsThemes)s third-party plugins and themes on the WordPress.com %(businessPlanName)s plan? ' +
									'Whatever feature or design you want to add to your site, you’ll find a plugin or theme to get you there. ' +
									'Claim a %(discountRate)d%% discount when you renew your %(businessPlanName)s plan today – <b>just enter the code %(couponCode)s at checkout.</b>'
							),
							{
								numberOfPluginsThemes,
								discountRate,
								couponCode,
								businessPlanName,
							}
						),
						{ b: <strong /> }
					) }
				</Upsell>
			);
		case 'downgrade-monthly':
			return (
				<Upsell
					title={ __( 'Switch to flexible monthly payments' ) }
					acceptButtonText={ __( 'Switch to monthly payments' ) }
					onAccept={ () => props.onClickDowngrade?.( upsell ) }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgMonthlyPayments }
				>
					<>
						{ sprintf(
							/* translators: %(planCost)s is a monetary amount in the form of a cost */
							__(
								'By switching to monthly payments, you will keep most of the features for %(planCost)s per month.'
							),
							{
								planCost: formatCurrency( props.downgradePlanPrice ?? 0, currencyCode, {
									isSmallestUnit: true,
								} ),
							}
						) }{ ' ' }
						{ props.cancelBundledDomain &&
							props.includedDomainPurchase &&
							__(
								'You will lose your free domain registration since that feature is only included in annual/biannual plans.'
							) }
						{ refundAmount ? <br /> : null }
						{ refundAmount
							? sprintf(
									/* translators: %(refundAmount)s is a monetary amount in the form of a refund */
									__(
										'You can downgrade immediately and get a partial refund of %(refundAmount)s.'
									),
									{
										refundAmount: formatCurrency( refundAmount, currencyCode ),
									}
							  )
							: null }
					</>
				</Upsell>
			);
		case 'downgrade-personal':
			return (
				<Upsell
					title={ __( 'Switch to a more affordable plan' ) }
					/* translators: %(plan)s is WordPress.com Personal or another plan */
					acceptButtonText={ sprintf( __( 'Switch to the %(plan)s plan' ), {
						plan: personalPlanName,
					} ) }
					onAccept={ () => props.onClickDowngrade?.( upsell ) }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgSwitchPlan }
				>
					<>
						{ sprintf(
							/* translators: %(plan)s is WordPress.com Personal or another plan */
							__(
								'%(plan)s still gives you access to fast support, removal of ads, and more — and for 50%% of the cost of your current plan.'
							),
							{ plan: personalPlanName }
						) }{ ' ' }
						{ refundAmount
							? sprintf(
									/* translators: %(amount)s is a monetary amount in the form of a refund */
									__(
										'You can downgrade and get a partial refund of %(amount)s or ' +
											'continue to the next step and cancel the plan.'
									),
									{
										amount: formatCurrency( refundAmount, currencyCode ),
									}
							  )
							: null }
					</>
				</Upsell>
			);
		case 'free-month-offer':
			return (
				<Upsell
					title={ __( 'How about a free month?' ) }
					acceptButtonText={ __( 'Get a free month' ) }
					onAccept={ () => props.onClickFreeMonthOffer?.() }
					onDecline={ props.onDeclineUpsell }
					isBusy={ cancellationInProgress }
					image={ imgFreeMonth }
				>
					{ sprintf(
						/* translators: %(currentPlan)s is the name of the plan to which the customer is subscribed */
						__(
							'We get it – building a site takes time. ' +
								'But we’d love to see you stick around to build on what you started. ' +
								'How about a free month of your %(currentPlan)s plan subscription to continue building your site?'
						),
						{ planName }
					) }
				</Upsell>
			);
	}

	return null;
}

import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	Tooltip,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { TextBlur } from '../../../components/text-blur';
import { wpcomLink } from '../../../utils/link';
import { WPCOM_CREATOR_PLAN_SLUG } from '../lib/wpcom-hosting';
import { getTermSuffix } from '../products/lib/product-pricing';
import { getProductShortTitle } from '../products/lib/product-title';
import type { CartLine } from '../products/use-cart-lines';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

interface Props {
	lines: CartLine[];
	currency: string;
	term: TermPricing;
	total: number;
	commission: number;
	isTotalReady: boolean;
	/** A cart of free products is issued to the agency at once, with no client. */
	isFreeOnly: boolean;
	isUserUnverified: boolean;
	canSend: boolean;
	canCopy: boolean;
	isBusy: boolean;
	onSend: () => void;
	onCopy: () => void;
	onPurchase: () => void;
	onPreview: () => void;
}

const getLineName = ( product: AgencyProduct, quantity: number ) => {
	const name =
		product.slug === WPCOM_CREATOR_PLAN_SLUG
			? __( 'WordPress.com Site' )
			: getProductShortTitle( product );
	return quantity > 1
		? sprintf(
				/* translators: %1$s is the product name, %2$d the quantity. */
				__( '%1$s x %2$d' ),
				name,
				quantity
			)
		: name;
};

export default function ReferralSummary( {
	lines,
	currency,
	term,
	total,
	commission,
	isTotalReady,
	isFreeOnly,
	isUserUnverified,
	canSend,
	canCopy,
	isBusy,
	onSend,
	onCopy,
	onPurchase,
	onPreview,
}: Props ) {
	const suffix = getTermSuffix( term );

	const actions = isFreeOnly ? (
		<Button
			variant="primary"
			style={ { justifyContent: 'center' } }
			__next40pxDefaultSize
			isBusy={ isBusy }
			disabled={ isBusy || isUserUnverified }
			onClick={ onPurchase }
		>
			{ __( 'Purchase' ) }
		</Button>
	) : (
		<VStack spacing={ 2 }>
			<Button
				variant="primary"
				style={ { justifyContent: 'center' } }
				__next40pxDefaultSize
				isBusy={ isBusy }
				disabled={ ! canSend || isBusy || isUserUnverified }
				onClick={ onSend }
			>
				{ __( 'Send to client' ) }
			</Button>
			<Button
				variant="secondary"
				style={ { justifyContent: 'center' } }
				__next40pxDefaultSize
				isBusy={ isBusy }
				disabled={ ! canCopy || isBusy || isUserUnverified }
				onClick={ onCopy }
			>
				{ __( 'Copy referral link' ) }
			</Button>
			<Button variant="link" className="referral-checkout__preview-link" onClick={ onPreview }>
				{ __( 'Preview email' ) }
			</Button>
		</VStack>
	);

	return (
		<Card className="referral-checkout__summary">
			<CardHeader>
				<SectionHeader level={ 2 } title={ __( 'Summary' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<VStack spacing={ 2 }>
						{ lines.map( ( { item, product, priceInfo, subtotal } ) => (
							<HStack key={ item.slug } justify="space-between" spacing={ 3 }>
								<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
									<Icon icon={ check } size={ 16 } className="referral-checkout__line-check" />
									<Text>{ getLineName( product, item.quantity ) }</Text>
								</HStack>
								<Text>
									<TextBlur isBlurred={ ! isTotalReady }>
										{ priceInfo.isFree
											? __( 'Free' )
											: formatCurrency( subtotal, currency ) + suffix }
									</TextBlur>
								</Text>
							</HStack>
						) ) }
					</VStack>
					<CardDivider />
					{ ! isFreeOnly && (
						<>
							<HStack justify="space-between" alignment="baseline">
								<Text weight={ 500 }>{ __( 'Total your client will pay' ) }</Text>
								<Heading level={ 3 } size={ 20 }>
									<TextBlur isBlurred={ ! isTotalReady }>
										{ formatCurrency( total, currency ) }
									</TextBlur>
								</Heading>
							</HStack>
							{ commission > 0 && (
								<HStack justify="space-between">
									<Text variant="muted">{ __( 'Your estimated commission' ) }</Text>
									<Text variant="muted">
										<TextBlur isBlurred={ ! isTotalReady }>
											{ formatCurrency( commission, currency ) + suffix }
										</TextBlur>
									</Text>
								</HStack>
							) }
						</>
					) }
					{ isUserUnverified ? (
						<Tooltip
							text={ __(
								'Please verify your account’s email in order to begin referring products to clients.'
							) }
						>
							<div>{ actions }</div>
						</Tooltip>
					) : (
						actions
					) }
					{ isUserUnverified && (
						<Text variant="muted" size={ 12 }>
							{ createInterpolateElement(
								__(
									'Please verify your <a>account’s email</a> in order to begin referring products to clients.'
								),
								{ a: <a href={ wpcomLink( '/me' ) } target="_blank" rel="noreferrer" /> }
							) }
						</Text>
					) }
					<CardDivider />
					{ isFreeOnly ? (
						<Text variant="muted" size={ 12 }>
							{ createInterpolateElement(
								__(
									'By purchasing, you agree to our <a>Terms of Service</a> and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time.'
								),
								{
									a: <a href={ wpcomLink( '/tos' ) } target="_blank" rel="noreferrer" />,
								}
							) }
						</Text>
					) : (
						<VStack spacing={ 2 }>
							<Text weight={ 500 } size={ 12 }>
								{ __( 'When you share this payment request:' ) }
							</Text>
							<Text variant="muted" size={ 12 }>
								{ __(
									'Your client will receive instructions to create a WordPress.com account and complete their purchase. Once their payment is successful, they’ll be enrolled in an automatically renewing subscription (monthly or annual, based on checkout). They can cancel anytime.'
								) }
							</Text>
							<Text variant="muted" size={ 12 }>
								{ __(
									'After their purchase, you’ll be able to manage the products on your client’s behalf.'
								) }
							</Text>
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

import { WPCOM_DIFM_LITE } from '@automattic/api-core';
import { productsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { Button, ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, published } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import ComponentViewTracker from '../component-view-tracker';
import { Text } from '../text';

export const DIFM_OFFER_FAQ_URL = 'https://difmrequest.com/faq/';

/**
 * The saving is the price of the paid DIFM service, in the currency the user pays in.
 */
function useDifmOfferSaving() {
	const { data: difmProduct } = useQuery( {
		...productsQuery(),
		select: ( products ) => products[ WPCOM_DIFM_LITE ],
	} );

	if ( ! difmProduct?.cost_smallest_unit || ! difmProduct.currency_code ) {
		return null;
	}

	return formatCurrency( difmProduct.cost_smallest_unit, difmProduct.currency_code, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
}

export function OfferStep( {
	titleId,
	tracksProps,
	onContinue,
	onHowItWorksClick,
}: {
	titleId: string;
	tracksProps: Record< string, unknown >;
	onContinue: () => void;
	onHowItWorksClick: () => void;
} ) {
	const saving = useDifmOfferSaving();

	const features = [
		createInterpolateElement( __( 'Backed by a <strong>14-day</strong> money-back guarantee' ), {
			strong: <strong />,
		} ),
		createInterpolateElement(
			__( 'Includes <strong>5 pages</strong>, with more available to purchase if needed' ),
			{ strong: <strong /> }
		),
		createInterpolateElement(
			__(
				'Plus the <strong>full Business plan</strong>: built-in site assistant, business email, email marketing, real-time backups, and more'
			),
			{ strong: <strong /> }
		),
	];

	return (
		<div className="difm-offer-modal__body is-offer-step">
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_impression"
				properties={ tracksProps }
			/>
			<VStack spacing={ 4 }>
				<div>
					<Badge intent="informational">
						{ saving
							? sprintf(
									/* translators: %s is the price of the DIFM service, for example $499. */
									__( 'Save %s · Limited-time offer' ),
									saving
								)
							: __( 'Limited-time offer' ) }
					</Badge>
				</div>
				<VStack spacing={ 3 }>
					<Text id={ titleId } as="h1" size={ 20 } weight={ 600 } lineHeight="24px">
						{ __( 'We’ll build your site for free' ) }
					</Text>
					<Text>
						{ __(
							'Upgrade to an annual Business plan and our human WordPress.com design experts will build your site for free. Once we have your content, your design will be ready within 4 business days.'
						) }
					</Text>
				</VStack>
				<ul className="difm-offer-modal__features">
					{ features.map( ( feature, index ) => (
						<li key={ index }>
							<Icon icon={ published } size={ 24 } />
							<Text>{ feature }</Text>
						</li>
					) ) }
				</ul>
			</VStack>
			<div className="difm-offer-modal__footer">
				<ExternalLink href={ DIFM_OFFER_FAQ_URL } onClick={ onHowItWorksClick }>
					{ __( 'How it works' ) }
				</ExternalLink>
				<Button variant="primary" __next40pxDefaultSize onClick={ onContinue }>
					{ __( 'Tell us about your site' ) }
				</Button>
			</div>
		</div>
	);
}

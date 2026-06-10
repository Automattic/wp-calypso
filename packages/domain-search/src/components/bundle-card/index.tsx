import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { DomainSearchNotice, DomainSuggestionBadge } from '../../ui';
import type { BundleSuggestion } from '@automattic/api-core';

import './style.scss';

interface BundleCardProps {
	suggestion: BundleSuggestion | null;
	onAddToCart?: ( bundle: BundleSuggestion ) => void;
	isAddedToCart?: boolean;
	onContinue?: () => void;
	isBusy?: boolean;
	disabled?: boolean;
	errorMessage?: string;
}

export const BundleCard = ( {
	suggestion,
	onAddToCart,
	isAddedToCart,
	onContinue,
	isBusy,
	disabled,
	errorMessage,
}: BundleCardProps ) => {
	const { __ } = useI18n();

	if ( ! suggestion || suggestion.domains.length === 0 ) {
		return (
			<div className="bundle-card bundle-card--empty">
				<Text className="bundle-card__empty-message">{ __( 'No bundle available.' ) }</Text>
			</div>
		);
	}

	const { sld, domains, bundle_price, original_price, discount_percent } = suggestion;

	const hasPremiumDomain = domains.some( ( domain ) => domain.is_premium );

	return (
		<div className="bundle-card">
			<VStack spacing={ 4 }>
				<Text as="h3" size={ 24 } weight={ 500 } className="bundle-card__sld">
					{ sld }
				</Text>

				<ul className="bundle-card__domains">
					{ domains.map( ( domain ) => (
						<li key={ domain.domain } className="bundle-card__domain">
							<HStack alignment="edge" spacing={ 2 }>
								<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
									<Text className="bundle-card__domain-name">{ domain.domain }</Text>
									{ domain.is_premium && (
										<DomainSuggestionBadge>{ __( 'Premium' ) }</DomainSuggestionBadge>
									) }
								</HStack>
								<Text className="bundle-card__domain-cost">{ domain.cost }</Text>
							</HStack>
						</li>
					) ) }
				</ul>

				<div className="bundle-card__pricing">
					<HStack alignment="center" justify="flex-start" spacing={ 2 } expanded={ false }>
						<Text size={ 20 } weight={ 500 } className="bundle-card__bundle-price">
							{ bundle_price }
						</Text>
						<Text className="bundle-card__original-price">
							<s>{ original_price }</s>
						</Text>
					</HStack>
					<Text className="bundle-card__discount">
						{ sprintf(
							// translators: %(percent)d is the bundle discount percentage, e.g. 20.
							__( 'Save %(percent)d%%' ),
							{ percent: discount_percent }
						) }
					</Text>
				</div>

				{ hasPremiumDomain && (
					<Text size={ 12 } className="bundle-card__premium-notice">
						{ __(
							'Premium domains are subject to different pricing and may not be eligible for promotions.'
						) }
					</Text>
				) }

				{ errorMessage && <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice> }

				{ isAddedToCart ? (
					<Button
						className="bundle-card__cta bundle-card__cta--continue"
						isPressed
						aria-pressed="mixed"
						__next40pxDefaultSize
						icon={ arrowRight }
						label={ __( 'Continue' ) }
						disabled={ disabled }
						onClick={ () => onContinue?.() }
					>
						{ __( 'Continue' ) }
					</Button>
				) : (
					<Button
						className="bundle-card__cta"
						variant="primary"
						__next40pxDefaultSize
						isBusy={ isBusy }
						disabled={ disabled }
						onClick={ () => onAddToCart?.( suggestion ) }
					>
						{ __( 'Get bundle' ) }
					</Button>
				) }
			</VStack>
		</div>
	);
};

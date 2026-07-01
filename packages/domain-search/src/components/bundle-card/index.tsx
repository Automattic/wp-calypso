import {
	Button,
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { arrowRight, Icon, plus, shield } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSearchNotice, DomainSuggestionBadge, DomainSuggestionPrice } from '../../ui';
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
	/**
	 * Set when the card is rendered inside the featured suggestions list, so it
	 * carries the same `listitem` role as its row-mates. Left off when the card
	 * stands alone in its own row.
	 */
	isListItem?: boolean;
}

export const BundleCard = ( {
	suggestion,
	onAddToCart,
	isAddedToCart,
	onContinue,
	isBusy,
	disabled,
	errorMessage,
	isListItem,
}: BundleCardProps ) => {
	const { __ } = useI18n();

	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();

	const contextValue = useMemo(
		() =>
			( {
				activeQuery,
				priceAlignment: 'left',
				priceSize: activeQuery === 'large' ? 20 : 18,
				isFeatured: true,
				currentWidth,
			} ) as const,
		[ activeQuery, currentWidth ]
	);

	if ( ! suggestion || suggestion.domains.length === 0 ) {
		return (
			<div className="bundle-card bundle-card--empty">
				<Text className="bundle-card__empty-message">{ __( 'No bundle available.' ) }</Text>
			</div>
		);
	}

	const { domains, bundle_price, original_price, bundle_cost, original_cost, discount_percent } =
		suggestion;

	const hasPremiumDomain = domains.some( ( domain ) => domain.is_premium );

	// The backend returns preformatted currency strings; fall back to the raw
	// amount only if the payload predates that contract.
	const bundleCost = bundle_cost ?? String( bundle_price );
	const originalCost = original_cost ?? String( original_price );

	// The bundle heading is the set of TLDs (".com + .org + .net"); the shared
	// SLD is spelled out in the companion list below.
	const tlds = domains.map( ( { domain } ) => domain.slice( domain.indexOf( '.' ) ) );
	const domainList = domains.map( ( { domain } ) => domain ).join( ', ' );

	return (
		<DomainSuggestionContainerContext.Provider value={ contextValue }>
			<Card
				ref={ containerRef }
				role={ isListItem ? 'listitem' : undefined }
				title={ domainList }
				className="domain-suggestion-featured bundle-card"
			>
				<CardBody
					className="bundle-card__body"
					style={ { padding: activeQuery === 'large' ? '1.5rem' : '1rem' } }
				>
					<VStack spacing={ 4 } className="bundle-card__content">
						<HStack alignment="center" spacing={ 2 } className="bundle-card__header">
							<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
								<Icon icon={ shield } size={ 20 } className="bundle-card__header-icon" />
								<Text weight={ 500 } className="bundle-card__header-title">
									{ __( 'Protect your brand' ) }
								</Text>
							</HStack>
							<DomainSuggestionBadge>
								{ sprintf(
									// translators: %(percent)d is the bundle discount percentage, e.g. 78.
									__( 'Bundle and save %(percent)d%%' ),
									{ percent: discount_percent }
								) }
							</DomainSuggestionBadge>
						</HStack>

						<VStack spacing={ 1 }>
							<Text
								size={ activeQuery === 'large' ? 32 : 24 }
								className="bundle-card__tlds"
								style={ { wordBreak: 'break-all' } }
							>
								{ tlds.map( ( tld, index ) => (
									<Fragment key={ domains[ index ].domain }>
										{ index > 0 && (
											<span className="bundle-card__tld-separator" aria-hidden="true">
												{ ' + ' }
											</span>
										) }
										<span style={ { whiteSpace: 'nowrap' } }>{ tld }</span>
									</Fragment>
								) ) }
							</Text>
							<Text variant="muted" className="bundle-card__domain-list">
								{ domainList }
							</Text>
						</VStack>

						<HStack alignment="center" spacing={ 4 } className="bundle-card__pricing-row">
							<DomainSuggestionPrice
								price={ originalCost }
								salePrice={ bundleCost }
								renewPrice={ originalCost }
							/>
							{ isAddedToCart ? (
								<Button
									className="bundle-card__cta bundle-card__cta--continue"
									variant="secondary"
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
									variant="secondary"
									icon={ plus }
									__next40pxDefaultSize
									isBusy={ isBusy }
									disabled={ disabled }
									onClick={ () => onAddToCart?.( suggestion ) }
								>
									{ __( 'Get bundle' ) }
								</Button>
							) }
						</HStack>

						{ hasPremiumDomain && (
							<Text size={ 12 } className="bundle-card__premium-notice">
								{ __(
									'Premium domains are subject to different pricing and may not be eligible for promotions.'
								) }
							</Text>
						) }

						{ errorMessage && (
							<DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>
						) }

						<HStack
							justify="flex-start"
							spacing={ 2 }
							expanded={ false }
							className="bundle-card__footer"
						>
							<Icon icon={ shield } size={ 20 } className="bundle-card__footer-icon" />
							<Text variant="muted" size={ 13 } className="bundle-card__footer-text">
								{ __( 'Claim popular domain extensions to avoid copycats' ) }
							</Text>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</DomainSuggestionContainerContext.Provider>
	);
};

import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { arrowRight, Icon, lockOutline, plus, shield } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import { getTld } from '../../helpers/get-tld';
import { BundlePrice, BundleTldChips, DomainSearchNotice, DomainSuggestionBadge } from '../../ui';
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

	const { domains, bundle_price, bundle_cost, original_price, original_cost, discount_percent } =
		suggestion;

	const hasPremiumDomain = domains.some( ( domain ) => domain.is_premium );
	const displayBundlePrice = String( bundle_cost ?? bundle_price );
	const displayOriginalPrice = String( original_cost ?? original_price );

	const tlds = domains.map( ( domain ) => getTld( domain.domain ) );

	const cta = isAddedToCart ? (
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
			variant="secondary"
			icon={ plus }
			__next40pxDefaultSize
			isBusy={ isBusy }
			disabled={ disabled }
			onClick={ () => onAddToCart?.( suggestion ) }
		>
			{ __( 'Get bundle' ) }
		</Button>
	);

	return (
		<div className="bundle-card">
			<VStack spacing={ 4 }>
				<HStack
					justify="flex-start"
					spacing={ 3 }
					expanded={ false }
					className="bundle-card__header"
				>
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						<Icon icon={ lockOutline } size={ 20 } className="bundle-card__lock-icon" />
						<Text size={ 14 } weight={ 500 }>
							{ __( 'Protect your brand' ) }
						</Text>
					</HStack>
					<DomainSuggestionBadge variation="warning">
						{ sprintf(
							// translators: %(percent)d is the bundle discount percentage, e.g. 20.
							__( 'Bundle and save %(percent)d%%' ),
							{ percent: discount_percent }
						) }
					</DomainSuggestionBadge>
				</HStack>

				<BundleTldChips tlds={ tlds } size={ 28 } className="bundle-card__tlds" />

				<Text variant="muted" className="bundle-card__members">
					{ domains.map( ( domain, index ) => {
						const tld = getTld( domain.domain );
						const sld = tld ? domain.domain.slice( 0, -( tld.length + 1 ) ) : domain.domain;
						return (
							<Fragment key={ domain.domain }>
								{ index > 0 && ', ' }
								{ sld }
								{ tld && <span className="bundle-card__member-tld">.{ tld }</span> }
							</Fragment>
						);
					} ) }
				</Text>

				{ hasPremiumDomain && (
					<Text size={ 12 } className="bundle-card__premium-notice">
						{ __(
							'Premium domains are subject to different pricing and may not be eligible for promotions.'
						) }
					</Text>
				) }

				{ errorMessage && <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice> }

				<HStack
					alignment="center"
					justify="space-between"
					spacing={ 4 }
					className="bundle-card__price-row"
				>
					<BundlePrice
						originalPrice={ displayOriginalPrice }
						bundlePrice={ displayBundlePrice }
						renewalPrice={ displayOriginalPrice }
						size={ 24 }
						alignment="left"
					/>
					<div className="bundle-card__cta-wrapper">{ cta }</div>
				</HStack>

				<div className="bundle-card__footer">
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						<Icon icon={ shield } size={ 20 } className="bundle-card__footer-icon" />
						<Text size={ 12 } variant="muted" className="bundle-card__tagline">
							{ __( 'Claim popular domain extensions to avoid copycats' ) }
						</Text>
					</HStack>
				</div>
			</VStack>
		</div>
	);
};

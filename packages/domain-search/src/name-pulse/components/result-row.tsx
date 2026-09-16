import { DomainAvailabilityStatus } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal, DomainSuggestionBadge } from '../../ui';
import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import type { DomainAvailability } from '@automattic/api-core';

export interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
	/**
	 * Receives the v1.3 real-time verdict so the row (and any duplicate of it
	 * in another section) reflects what the registry actually said.
	 */
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

const isAvailableStatus = ( status: DomainAvailabilityStatus ) =>
	status === DomainAvailabilityStatus.AVAILABLE ||
	status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

export const toRealtimeUpdate = (
	domainName: string,
	availability: DomainAvailability
): NamePulseDomainUpdate => {
	const available = isAvailableStatus( availability.status );

	return {
		domain_name: domainName,
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		cost: available ? availability.cost : undefined,
		raw_price: availability.raw_price,
		sale_cost: availability.sale_cost,
		currency_code: availability.currency_code,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		product_id: availability.product_id,
		product_slug: availability.product_slug,
		supports_privacy: availability.supports_privacy,
		vendor: availability.root_domain_provider,
		is_realtime: true,
	};
};

const formatPrice = ( amount: number, currencyCode?: string ) =>
	formatCurrency( amount, currencyCode ?? 'USD', { stripZeros: true } );

const Price = ( { result }: { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const { cost, raw_price: rawPrice, sale_cost: saleCost, currency_code: currencyCode } = result;
	const yearlyPrice = typeof rawPrice === 'number' ? formatPrice( rawPrice, currencyCode ) : cost;

	if ( ! yearlyPrice ) {
		return null;
	}

	if ( typeof saleCost === 'number' ) {
		return (
			<span className="name-pulse-row__price name-pulse-row__price--sale">
				<span className="name-pulse-row__price-line">
					<Text weight={ 600 }>{ formatPrice( saleCost, currencyCode ) }</Text>
					<Text size={ 12 } variant="muted">
						{ __( '/first year' ) }
					</Text>
				</span>
				<Text size={ 12 } variant="muted">
					{ sprintf(
						// translators: %(price)s is the domain renewal price.
						__( '%(price)s/year renewal' ),
						{ price: yearlyPrice }
					) }
				</Text>
			</span>
		);
	}

	return (
		<span className="name-pulse-row__price">
			<span className="name-pulse-row__price-line">
				<Text weight={ 600 }>{ yearlyPrice }</Text>
				<Text size={ 12 } variant="muted">
					{ __( '/year' ) }
				</Text>
			</span>
		</span>
	);
};

export const NamePulseResultRow = ( { result, position, onUpdate }: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimModalOpen, setTrademarkClaimModalOpen ] = useState( false );

	const {
		domain_name: domainName,
		suffix,
		status,
		is_premium: isPremium,
		is_realtime: isRealtime,
		sale_cost: saleCost,
	} = result;
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	// Bulk results carry no premium pricing; the badge stands in for the price
	// until the real-time check on click fills it in.
	const showPremiumBadge = isAvailable && isPremium && ! isRealtime;
	const showSaleBadge = isAvailable && typeof saleCost === 'number';
	const inCart = cart.hasItem( domainName );

	const {
		mutate: toggleCart,
		isPending,
		error,
	} = useMutation( {
		mutationFn: async ( { acceptedTrademarkClaim }: { acceptedTrademarkClaim: boolean } ) => {
			if ( inCart ) {
				const item = cart.items.find( ( i ) => `${ i.domain }.${ i.tld }` === domainName );
				if ( item ) {
					await cart.onRemoveItem( item.uuid );
				}
				return { addedToCart: false };
			}

			// Bulk results are zone-file based (~25% mismatch); the real EPP check
			// runs on click, exactly like the classic suggestion CTA.
			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);
			const suggestion = convertAvailabilityToSuggestion( availability );

			events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );
			onUpdate?.( toRealtimeUpdate( domainName, availability ) );

			if ( ! isAvailableStatus( availability.status ) ) {
				throw new Error( __( 'Sorry, this domain is no longer available.' ) );
			}

			if ( availability.trademark_claims_notice_info && ! acceptedTrademarkClaim ) {
				events.onTrademarkClaimsNoticeShown( {
					...suggestion,
					position,
					price_rule: DomainPriceRule.PRICE,
				} );
				setTrademarkClaimModalOpen( true );
				return { addedToCart: false };
			}

			await cart.onAddItem( suggestion );
			return { addedToCart: true, suggestion };
		},
		onSuccess: ( data ) => {
			if ( data.addedToCart && data.suggestion ) {
				events.onAddDomainToCart(
					domainName,
					position,
					data.suggestion.is_premium ?? false,
					data.suggestion.vendor
				);
			}
		},
		networkMode: 'always',
		retry: false,
	} );

	const trademarkClaimsNoticeInfo = queryClient.getQueryData< DomainAvailability >(
		queries.domainAvailability( domainName ).queryKey
	)?.trademark_claims_notice_info;

	return (
		<div
			className="name-pulse-row"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span className="name-pulse-row__name">
				<span className="name-pulse-row__domain">
					<Text as="span" variant="muted" truncate>
						{ label }
					</Text>
					<Text as="span" weight={ 600 } variant={ isUnavailable ? 'muted' : undefined }>
						{ suffix ? `.${ suffix }` : '' }
					</Text>
				</span>
				{ showSaleBadge && (
					<DomainSuggestionBadge variation="warning">{ __( 'Sale' ) }</DomainSuggestionBadge>
				) }
				{ showPremiumBadge && (
					<DomainSuggestionBadge variation="warning">{ __( 'Premium' ) }</DomainSuggestionBadge>
				) }
			</span>
			<span className="name-pulse-row__status">
				{ isWaiting && (
					<span className="name-pulse-row__skeleton" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isAvailable && (
					<>
						{ ! showPremiumBadge && <Price result={ result } /> }
						<Button
							className="name-pulse-row__cart"
							icon={ cartIcon }
							label={ inCart ? __( 'Remove from cart' ) : __( 'Add to cart' ) }
							variant={ inCart ? 'primary' : undefined }
							size="compact"
							isBusy={ isPending }
							disabled={ isPending }
							aria-pressed={ inCart }
							onClick={ () => toggleCart( { acceptedTrademarkClaim: false } ) }
						/>
					</>
				) }
			</span>
			{ error && (
				<Text className="name-pulse-row__error" variant="muted" size={ 12 }>
					{ error.message }
				</Text>
			) }
			{ trademarkClaimsNoticeInfo && trademarkClaimModalOpen && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
					onAccept={ () => {
						setTrademarkClaimModalOpen( false );
						toggleCart( { acceptedTrademarkClaim: true } );
					} }
					onClose={ () => setTrademarkClaimModalOpen( false ) }
				/>
			) }
		</div>
	);
};

export const NamePulseResultRowSkeleton = () => (
	<div className="name-pulse-row name-pulse-row--skeleton" aria-hidden="true">
		<span className="name-pulse-row__skeleton name-pulse-row__skeleton--name" />
		<span className="name-pulse-row__skeleton" />
	</div>
);

import { DomainAvailabilityStatus } from '@automattic/api-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { NamePulseDomainStatus, pickPricing, type NamePulseDomainUpdate } from '../helpers';
import type { DomainAvailability } from '@automattic/api-core';

const isAvailableStatus = ( status: DomainAvailabilityStatus ) =>
	status === DomainAvailabilityStatus.AVAILABLE ||
	status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

const toRealtimeUpdate = (
	domainName: string,
	availability: DomainAvailability
): NamePulseDomainUpdate => {
	const available = isAvailableStatus( availability.status );

	return {
		domain_name: domainName,
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		...pickPricing( availability ),
		cost: available ? availability.cost : undefined,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		is_realtime: true,
	};
};

/**
 * Toggles a Name Pulse result in the cart. Bulk results are zone-file based and
 * approximate, so the real-time check runs before anything reaches the cart and
 * its verdict is reported through `onUpdate`.
 */
export const useNamePulseAddToCart = (
	domainName: string,
	position: number,
	onUpdate?: ( update: NamePulseDomainUpdate ) => void
) => {
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimsNoticeInfo, setTrademarkClaimsNoticeInfo ] =
		useState< DomainAvailability[ 'trademark_claims_notice_info' ] >();
	const inCart = cart.hasItem( domainName );

	const { mutate, isPending, error } = useMutation( {
		mutationFn: async ( { acceptedTrademarkClaim }: { acceptedTrademarkClaim: boolean } ) => {
			if ( inCart ) {
				const item = cart.items.find( ( i ) => `${ i.domain }.${ i.tld }` === domainName );
				if ( item ) {
					await cart.onRemoveItem( item.uuid );
				}
				return { addedToCart: false };
			}

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
				setTrademarkClaimsNoticeInfo( availability.trademark_claims_notice_info );
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

	return {
		inCart,
		isPending,
		error,
		toggleCart: () => mutate( { acceptedTrademarkClaim: false } ),
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim: () => {
			setTrademarkClaimsNoticeInfo( undefined );
			mutate( { acceptedTrademarkClaim: true } );
		},
		dismissTrademarkClaim: () => setTrademarkClaimsNoticeInfo( undefined ),
	};
};

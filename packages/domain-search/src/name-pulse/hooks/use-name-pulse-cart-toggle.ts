import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { isNamePulseAvailable, toNamePulseRealtimeVerdict } from '../helpers';
import { setNamePulseVerdict } from './use-name-pulse-verdicts';
import type { DomainAvailability } from '@automattic/api-core';

/**
 * Adds a name to the cart, or removes it when it is already there. The row and
 * the exact-match card share it, so both run the same real-time check first.
 */
export const useNamePulseCartToggle = ( domainName: string, position: number ) => {
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimsNoticeInfo, setTrademarkClaimsNoticeInfo ] =
		useState< DomainAvailability[ 'trademark_claims_notice_info' ] >();

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

			// Bulk results are zone-file based and approximate; the real-time check runs
			// before anything reaches the cart, and every row listing the name reads it.
			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);
			const suggestion = convertAvailabilityToSuggestion( availability );

			events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );
			setNamePulseVerdict( queryClient, domainName, {
				...toNamePulseRealtimeVerdict( availability ),
				is_cart_check: true,
			} );

			if ( ! isNamePulseAvailable( availability ) ) {
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
		toggleCart: () => toggleCart( { acceptedTrademarkClaim: false } ),
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim: () => {
			setTrademarkClaimsNoticeInfo( undefined );
			toggleCart( { acceptedTrademarkClaim: true } );
		},
		closeTrademarkClaims: () => setTrademarkClaimsNoticeInfo( undefined ),
	};
};

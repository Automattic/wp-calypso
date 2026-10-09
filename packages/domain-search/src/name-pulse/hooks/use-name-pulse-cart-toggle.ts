import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import {
	getNamePulseResultTracksProps,
	getNamePulseTracksVendor,
	isNamePulseAvailable,
	toNamePulseRealtimeVerdict,
	toNamePulseTracksSuggestion,
	type NamePulseDomainResult,
	type NamePulseTracksSection,
} from '../helpers';
import { setNamePulseVerdict } from './use-name-pulse-verdicts';
import type { DomainAvailability, PolicyNotice } from '@automattic/api-core';

export interface NamePulsePolicyNotice {
	title: string;
	message: string;
}

export type NamePulseCartToggleResult = Pick<
	NamePulseDomainResult,
	| 'domain_name'
	| 'suffix'
	| 'source'
	| 'status'
	| 'is_premium'
	| 'cost'
	| 'raw_price'
	| 'currency_code'
>;

/**
 * Adds a name to the cart, or removes it when it is already there. The row and
 * the exact-match card share it, so both run the same real-time check first,
 * and both confirm the TLD's special requirements before adding.
 */
export const useNamePulseCartToggle = (
	result: NamePulseCartToggleResult,
	section: NamePulseTracksSection,
	position: number,
	policyNotices: PolicyNotice[] = []
) => {
	const domainName = result.domain_name;
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimsNoticeInfo, setTrademarkClaimsNoticeInfo ] =
		useState< DomainAvailability[ 'trademark_claims_notice_info' ] >();
	const [ isPolicyNoticeOpen, setIsPolicyNoticeOpen ] = useState( false );
	// Held from the moment the dialog opens: the real-time check that runs on
	// confirming can update the name's notices while the dialog is still showing.
	const [ policyNotice, setPolicyNotice ] = useState< NamePulsePolicyNotice >();

	const inCart = cart.hasItem( domainName );
	const tracksSuggestion = toNamePulseTracksSuggestion( result, position );
	const tracksVendor = getNamePulseTracksVendor( result.source );

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
				return { addedToCart: false, removedFromCart: true };
			}

			// Bulk results are zone-file based and approximate; the real-time check runs
			// before anything reaches the cart, and every row listing the name reads it.
			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);
			const suggestion = convertAvailabilityToSuggestion( availability );

			events.onDomainAddAvailabilityPreCheck( availability, domainName, tracksVendor );
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
					vendor: tracksVendor,
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
			if ( data.removedFromCart ) {
				events.onNamePulseTracksEvent(
					'result_remove_from_cart',
					getNamePulseResultTracksProps( result, section, position )
				);
			}

			if ( data.addedToCart && data.suggestion ) {
				events.onAddDomainToCart(
					domainName,
					position,
					data.suggestion.is_premium ?? false,
					tracksVendor
				);
				events.onNamePulseTracksEvent(
					'result_add_to_cart',
					getNamePulseResultTracksProps(
						{ ...result, is_premium: data.suggestion.is_premium ?? result.is_premium },
						section,
						position
					)
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
		toggleCart: () => {
			if ( ! inCart ) {
				events.onSuggestionInteract( tracksSuggestion );
			}

			if ( inCart || policyNotices.length === 0 ) {
				toggleCart( { acceptedTrademarkClaim: false } );
				return;
			}
			setPolicyNotice( {
				title: policyNotices[ 0 ].label,
				message: policyNotices.map( ( notice ) => notice.message ).join( ' ' ),
			} );
			setIsPolicyNoticeOpen( true );
		},
		policyNotice,
		isPolicyNoticeOpen,
		confirmPolicyNotice: () =>
			toggleCart(
				{ acceptedTrademarkClaim: false },
				{ onSettled: () => setIsPolicyNoticeOpen( false ) }
			),
		closePolicyNotice: () => ! isPending && setIsPolicyNoticeOpen( false ),
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim: () => {
			events.onTrademarkClaimsNoticeAccepted( tracksSuggestion );
			setTrademarkClaimsNoticeInfo( undefined );
			toggleCart( { acceptedTrademarkClaim: true } );
		},
		closeTrademarkClaims: () => {
			events.onTrademarkClaimsNoticeClosed( tracksSuggestion );
			setTrademarkClaimsNoticeInfo( undefined );
		},
	};
};

import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { useState } from 'react';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useSuggestion } from '../../hooks/use-suggestion';
import { UNAVAILABLE_FOR_PURCHASE_STATUSES } from '../../page/constants';
import { useDomainSearch } from '../../page/context';
import {
	DomainSearchTrademarkClaimsModal,
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';

export interface DomainSuggestionCTAProps {
	domainName: string;
}

export const DomainSuggestionCTA = ( { domainName }: DomainSuggestionCTAProps ) => {
	const { cart, events, queries, query, setBlockedSuggestion } = useDomainSearch();
	const suggestion = useSuggestion( domainName );

	const queryClient = useQueryClient();

	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

	const [ trademarkClaimModalOpen, setTrademarkClaimModalOpen ] = useState( false );

	const { mutationId, isCurrentMutation } = useIsCurrentMutation();

	const {
		mutate: addToCart,
		isPending,
		error,
	} = useMutation( {
		meta: {
			mutationId,
		},
		mutationFn: async ( { acceptedTrademarkClaim }: { acceptedTrademarkClaim: boolean } ) => {
			setBlockedSuggestion( null );

			if ( acceptedTrademarkClaim ) {
				events.onTrademarkClaimsNoticeAccepted( suggestion );
				await cart.onAddItem( suggestion );
				return { addedToCart: true };
			}

			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);

			events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );

			if ( UNAVAILABLE_FOR_PURCHASE_STATUSES.includes( availability.status ) ) {
				setBlockedSuggestion( { query, availability } );
				return;
			}

			if ( ! availability.trademark_claims_notice_info ) {
				await cart.onAddItem( suggestion );
				return { addedToCart: true };
			}

			events.onTrademarkClaimsNoticeShown( suggestion );
			setTrademarkClaimModalOpen( true );
		},
		onSuccess: ( data ) => {
			if ( data?.addedToCart ) {
				events.onAddDomainToCart(
					domainName,
					suggestion.position,
					suggestion.is_premium ?? false,
					suggestion.vendor
				);
			}
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();

	if ( availability?.is_price_limit_exceeded ) {
		return (
			<DomainSuggestionPrimaryCTA
				href="https://wordpress.com/help/contact"
				label={ __( 'Interested in this domain? Contact support' ) }
				icon={ envelope }
			>
				{ __( 'Contact support' ) }
			</DomainSuggestionPrimaryCTA>
		);
	}

	const isDomainOnCart = cart.hasItem( domainName );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA disabled={ isMutating } onClick={ events.onContinue } />;
	}

	const errorMessage = isCurrentMutation && error?.message;

	if ( errorMessage ) {
		return (
			<DomainSuggestionErrorCTA
				errorMessage={ errorMessage }
				callback={ () => addToCart( { acceptedTrademarkClaim: false } ) }
			/>
		);
	}

	return (
		<>
			<DomainSuggestionPrimaryCTA
				disabled={ isMutating }
				isBusy={ isPending }
				onClick={ () => {
					events.onSuggestionInteract( suggestion );
					addToCart( { acceptedTrademarkClaim: false } );
				} }
			/>
			{ availability?.trademark_claims_notice_info && trademarkClaimModalOpen && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ availability.trademark_claims_notice_info }
					onAccept={ () => {
						setTrademarkClaimModalOpen( false );
						addToCart( { acceptedTrademarkClaim: true } );
					} }
					onClose={ () => {
						setTrademarkClaimModalOpen( false );
						events.onTrademarkClaimsNoticeClosed( suggestion );
					} }
				/>
			) }
		</>
	);
};

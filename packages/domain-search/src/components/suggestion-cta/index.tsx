import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { useState } from 'react';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useSuggestion } from '../../hooks/use-suggestion';
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
	const { cart, events, queries } = useDomainSearch();
	const suggestion = useSuggestion( domainName );

	const queryClient = useQueryClient();

	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

	const [ trademarkClaimModalOpen, setTrademarkClaimModalOpen ] = useState( false );

	const {
		mutate: addToCart,
		isPending,
		error,
		submittedAt,
	} = useMutation( {
		mutationFn: async ( { acceptedTrademarkClaim }: { acceptedTrademarkClaim: boolean } ) => {
			if ( acceptedTrademarkClaim ) {
				return cart.onAddItem( suggestion );
			}

			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);

			if ( ! availability?.trademark_claims_notice_info ) {
				return cart.onAddItem( suggestion );
			}

			setTrademarkClaimModalOpen( true );
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();
	const isCurrentMutation = useIsCurrentMutation( submittedAt );

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
				onClick={ () => addToCart( { acceptedTrademarkClaim: false } ) }
			/>
			{ availability?.trademark_claims_notice_info && trademarkClaimModalOpen && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ availability.trademark_claims_notice_info }
					onAccept={ () => {
						setTrademarkClaimModalOpen( false );
						addToCart( { acceptedTrademarkClaim: true } );
					} }
					onClose={ () => setTrademarkClaimModalOpen( false ) }
				/>
			) }
		</>
	);
};

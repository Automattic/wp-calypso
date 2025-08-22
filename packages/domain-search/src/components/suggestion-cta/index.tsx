import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import {
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

	const {
		mutate: addToCart,
		isPending,
		error,
		submittedAt,
	} = useMutation( {
		mutationFn: () => cart.onAddItem( suggestion ),
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();
	const isCurrentMutation = useIsCurrentMutation( submittedAt );

	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

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
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ addToCart } />;
	}

	return (
		<DomainSuggestionPrimaryCTA
			disabled={ isMutating }
			isBusy={ isPending }
			onClick={ addToCart }
		/>
	);
};

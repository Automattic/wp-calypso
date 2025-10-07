import { useMutation, useIsMutating } from '@tanstack/react-query';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useDomainSearch } from '../../page/context';
import { DomainsFullCartItem } from '../../ui';
import type { SelectedDomain } from '../../page/types';

export const CartItem = ( { item }: { item: SelectedDomain } ) => {
	const { cart } = useDomainSearch();

	const {
		mutate: removeProductFromCart,
		isPending,
		reset,
		error,
		submittedAt,
	} = useMutation( {
		mutationFn: ( uuid: string ) => {
			return cart.onRemoveItem( uuid );
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();
	const isCurrentMutation = useIsCurrentMutation( submittedAt );

	return (
		<DomainsFullCartItem
			key={ item.uuid }
			domain={ item }
			disabled={ isMutating }
			isBusy={ isPending }
			onRemove={ () => removeProductFromCart( item.uuid ) }
			errorMessage={ isCurrentMutation ? error?.message : undefined }
			removeErrorMessage={ reset }
		/>
	);
};

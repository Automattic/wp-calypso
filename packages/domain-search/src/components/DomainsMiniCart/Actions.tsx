import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsMiniCartActions = () => {
	const { onContinue, openFullCart } = useDomainSearch();

	return (
		<HStack spacing={ 2 }>
			<Button variant="tertiary" onClick={ () => openFullCart() }>
				View cart
			</Button>
			<Button variant="primary" onClick={ () => onContinue() }>
				Continue
			</Button>
		</HStack>
	);
};

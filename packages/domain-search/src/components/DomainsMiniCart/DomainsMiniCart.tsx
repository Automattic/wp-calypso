import { __experimentalHStack as HStack } from '@wordpress/components';
import { useDomainSearch } from '../DomainSearch/DomainSearch';
import { DomainsMiniCartActions } from './Actions';
import { DomainsMiniCartSummary } from './Summary';

const DomainsMiniCart = () => {
	const { selectedDomains, isFullCartOpen } = useDomainSearch();

	if ( selectedDomains.length === 0 || isFullCartOpen ) {
		return null;
	}

	return (
		<HStack spacing={ 2 }>
			<DomainsMiniCartSummary />
			<DomainsMiniCartActions />
		</HStack>
	);
};

DomainsMiniCart.Summary = DomainsMiniCartSummary;
DomainsMiniCart.Actions = DomainsMiniCartActions;

export { DomainsMiniCart };

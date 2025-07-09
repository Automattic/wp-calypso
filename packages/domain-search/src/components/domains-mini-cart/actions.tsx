import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../domain-search';

export const DomainsMiniCartActions = () => {
	const { onContinue, openFullCart } = useDomainSearch();
	const { __ } = useI18n();

	return (
		<HStack spacing={ 2 } style={ { width: 'auto' } }>
			<Button variant="tertiary" onClick={ () => openFullCart() }>
				{ __( 'View cart' ) }
			</Button>
			<Button variant="primary" onClick={ () => onContinue() }>
				{ __( 'Continue' ) }
			</Button>
		</HStack>
	);
};

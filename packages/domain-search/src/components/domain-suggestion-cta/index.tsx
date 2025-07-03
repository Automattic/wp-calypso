import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../DomainSearch/DomainSearch';
import { Domain } from '../DomainSearch/types';
import { shoppingCartIcon } from './shopping-cart-icon';

import './style.scss';

export const DomainSuggestionCTA = ( { domain }: { domain: Domain } ) => {
	const { __ } = useI18n();
	const { cart, onContinue } = useDomainSearch();

	const isDomainOnCart = cart.hasItem( domain );

	if ( isDomainOnCart ) {
		return (
			<Button
				variant="primary"
				__next40pxDefaultSize
				icon={ arrowRight }
				className="domain-suggestion-cta domain-suggestion-cta--continue"
				onClick={ onContinue }
			>
				{ __( 'Continue' ) }
			</Button>
		);
	}

	return (
		<Button
			className="domain-suggestion-cta"
			variant="primary"
			__next40pxDefaultSize
			icon={ shoppingCartIcon }
			onClick={ () => cart.onAddItem( domain ) }
		>
			{ __( 'Add to Cart' ) }
		</Button>
	);
};

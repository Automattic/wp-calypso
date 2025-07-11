import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../domain-search';
import { shoppingCartIcon } from './shopping-cart-icon';

import './style.scss';

interface DomainSuggestionCTAProps {
	compact?: boolean;
	uuid: string;
}

export const DomainSuggestionCTA = ( { compact, uuid }: DomainSuggestionCTAProps ) => {
	const { __ } = useI18n();
	const { cart, onContinue } = useDomainSearch();

	const isDomainOnCart = cart.hasItem( uuid );

	if ( isDomainOnCart ) {
		return (
			<Button
				variant="primary"
				__next40pxDefaultSize
				icon={ arrowRight }
				className="domain-suggestion-cta domain-suggestion-cta--continue"
				onClick={ onContinue }
				label={ __( 'Continue' ) }
			>
				{ compact ? undefined : __( 'Continue' ) }
			</Button>
		);
	}

	return (
		<Button
			className="domain-suggestion-cta"
			variant="primary"
			__next40pxDefaultSize
			icon={ shoppingCartIcon }
			onClick={ () => cart.onAddItem( uuid ) }
			label={ __( 'Add to Cart' ) }
		>
			{ compact ? undefined : __( 'Add to Cart' ) }
		</Button>
	);
};

import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../domain-search';
import { shoppingCartIcon } from './shopping-cart-icon';

import './style.scss';

interface DomainSuggestionCTAProps {
	compact?: boolean;
	domainUuid: string;
}

export const DomainSuggestionCTA = ( { compact, domainUuid }: DomainSuggestionCTAProps ) => {
	const { __ } = useI18n();
	const { cart, onContinue } = useDomainSearch();

	const isDomainOnCart = cart.hasItem( domainUuid );

	if ( isDomainOnCart ) {
		return (
			<Button
				variant="primary"
				__next40pxDefaultSize
				icon={ arrowRight }
				className="domain-suggestion-cta domain-suggestion-cta--continue"
				onClick={ onContinue }
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
			onClick={ () => cart.onAddItem( domainUuid ) }
		>
			{ compact ? undefined : __( 'Add to Cart' ) }
		</Button>
	);
};

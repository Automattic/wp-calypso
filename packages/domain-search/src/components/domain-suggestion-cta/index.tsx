import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../domain-search';
import { shoppingCartIcon } from './shopping-cart-icon';
import type { SelectedDomain } from '../domain-search/types';

import './style.scss';

export const DomainSuggestionCTA = ( {
	compact,
	domainUuid,
}: {
	compact?: boolean;
	domainUuid: SelectedDomain[ 'uuid' ];
} ) => {
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

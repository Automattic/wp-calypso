import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../domain-search';
import { shoppingCartIcon } from './shopping-cart-icon';

import './style.scss';

export interface DomainSuggestionCTAProps {
	variant?: 'primary' | 'secondary';
	compact?: boolean;
	uuid: string;
	onClick?( action: 'add-to-cart' | 'continue' ): void;
	disabled?: boolean;
}

export const DomainSuggestionCTA = ( {
	variant = 'secondary',
	compact,
	uuid,
	onClick,
	disabled,
}: DomainSuggestionCTAProps ) => {
	const { __ } = useI18n();
	const { cart, onContinue } = useDomainSearch();

	const isDomainOnCart = cart.hasItem( uuid );

	if ( isDomainOnCart ) {
		const handleContinueClick = () => {
			onClick?.( 'continue' );
			onContinue();
		};

		return (
			<Button
				isPressed
				aria-pressed="mixed"
				__next40pxDefaultSize
				icon={ arrowRight }
				className="domain-suggestion-cta domain-suggestion-cta--continue"
				onClick={ handleContinueClick }
				label={ __( 'Continue' ) }
			>
				{ compact ? undefined : __( 'Continue' ) }
			</Button>
		);
	}

	const handleAddToCartClick = () => {
		onClick?.( 'add-to-cart' );
		cart.onAddItem( uuid );
	};

	return (
		<Button
			className="domain-suggestion-cta"
			variant={ variant }
			__next40pxDefaultSize
			icon={ shoppingCartIcon }
			onClick={ handleAddToCartClick }
			label={ __( 'Add to Cart' ) }
			disabled={ disabled }
		>
			{ compact ? undefined : __( 'Add to Cart' ) }
		</Button>
	);
};

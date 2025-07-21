import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
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
	const [ isBusy, setIsBusy ] = useState( false );

	const initiatedByThisComponent = useRef( false );

	useEffect( () => {
		if ( ! initiatedByThisComponent.current ) {
			return;
		}

		if ( cart.isBusy ) {
			setIsBusy( true );
		} else {
			setIsBusy( false );
			initiatedByThisComponent.current = false;
		}
	}, [ cart.isBusy ] );

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
				disabled={ disabled || cart.isBusy }
			>
				{ compact ? undefined : __( 'Continue' ) }
			</Button>
		);
	}

	const handleAddToCartClick = () => {
		initiatedByThisComponent.current = true;
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
			disabled={ disabled || cart.isBusy }
			isBusy={ isBusy }
		>
			{ compact ? undefined : __( 'Add to Cart' ) }
		</Button>
	);
};

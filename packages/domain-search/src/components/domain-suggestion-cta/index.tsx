import { Button, Tooltip } from '@wordpress/components';
import { arrowRight, warning } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { clsx } from 'clsx';
import { useFocusedCartAction } from '../../hooks/use-focused-cart-action';
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
	const { isBusy, errorMessage, callback } = useFocusedCartAction( () => {
		onClick?.( 'add-to-cart' );
		cart.onAddItem( uuid );
	} );

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

	if ( errorMessage ) {
		return (
			<div className="domain-suggestion-cta-error">
				<Tooltip
					delay={ 0 }
					text={ errorMessage }
					placement="top"
					className="domain-suggestion-cta-error__tooltip"
				>
					<Button
						className={ clsx( 'domain-suggestion-cta', 'domain-suggestion-cta--error' ) }
						isDestructive
						variant="primary"
						__next40pxDefaultSize
						onClick={ callback }
						icon={ warning }
					>
						{ compact ? undefined : __( 'Add to Cart' ) }
					</Button>
				</Tooltip>
			</div>
		);
	}

	return (
		<Button
			className="domain-suggestion-cta"
			variant={ variant }
			__next40pxDefaultSize
			icon={ shoppingCartIcon }
			onClick={ callback }
			label={ __( 'Add to Cart' ) }
			disabled={ disabled || cart.isBusy }
			isBusy={ isBusy }
		>
			{ compact ? undefined : __( 'Add to Cart' ) }
		</Button>
	);
};

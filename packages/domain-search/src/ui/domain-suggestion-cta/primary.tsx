import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { shoppingCartIcon } from './shopping-cart-icon';

import './primary.scss';

export const DomainSuggestionPrimaryCTA = ( {
	onClick,
	href,
	disabled,
	isBusy,
	label,
	icon,
	children,
}: {
	onClick?: () => void;
	href?: string;
	disabled?: boolean;
	isBusy?: boolean;
	label?: string;
	icon?: React.ReactElement;
	children?: React.ReactNode;
} ) => {
	const { __ } = useI18n();
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestionPrimaryCTA must be used within a DomainSuggestionsList' );
	}

	return (
		<Button
			className="domain-suggestion-cta"
			variant={ listContext.isFeatured ? 'primary' : 'secondary' }
			__next40pxDefaultSize
			icon={ icon ?? shoppingCartIcon }
			onClick={ onClick }
			href={ href }
			label={ label ?? __( 'Add to cart' ) }
			disabled={ disabled }
			isBusy={ isBusy }
		>
			{ listContext.isFeatured ? children ?? __( 'Add to cart' ) : undefined }
		</Button>
	);
};

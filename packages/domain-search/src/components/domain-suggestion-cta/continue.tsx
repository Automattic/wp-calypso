import { Button } from '@wordpress/components';
import { arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { useDomainSearch } from '../domain-search';

export const DomainSuggestionContinueCTA = ( {
	disabled,
	onClick,
}: {
	disabled: boolean;
	onClick: () => void;
} ) => {
	const { cart } = useDomainSearch();
	const { __ } = useI18n();
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestionContinueCTA must be used within a DomainSuggestionsList' );
	}

	return (
		<Button
			isPressed
			aria-pressed="mixed"
			__next40pxDefaultSize
			icon={ arrowRight }
			className="domain-suggestion-cta domain-suggestion-cta--continue"
			onClick={ onClick }
			label={ __( 'Continue' ) }
			disabled={ disabled || cart.isBusy }
		>
			{ listContext.isFeatured ? __( 'Continue' ) : undefined }
		</Button>
	);
};

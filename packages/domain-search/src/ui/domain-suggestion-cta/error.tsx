import { Button, Tooltip } from '@wordpress/components';
import { warning } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';

import './error.scss';

export const DomainSuggestionErrorCTA = ( {
	errorMessage,
	callback,
}: {
	errorMessage: string;
	callback: () => void;
} ) => {
	const { __ } = useI18n();
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestionErrorCTA must be used within a DomainSuggestionsList' );
	}

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
					label={ __( 'Add to cart' ) }
					onClick={ callback }
					icon={ warning }
				>
					{ listContext.isFeatured ? __( 'Add to cart' ) : undefined }
				</Button>
			</Tooltip>
		</div>
	);
};

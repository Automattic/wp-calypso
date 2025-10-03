import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import type { ComponentProps } from 'react';

import './style.scss';

export const DomainSuggestionLoadMore = ( props: ComponentProps< typeof Button > ) => {
	const { __ } = useI18n();

	return (
		<Button
			{ ...props }
			className="domain-suggestion-load-more__btn"
			variant="secondary"
			__next40pxDefaultSize
		>
			{ __( 'Show more results' ) }
		</Button>
	);
};

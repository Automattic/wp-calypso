import { LoadingPlaceholder } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { DomainSearchSkipSuggestionSkeleton } from './index.skeleton';

export const DomainSearchSkipSuggestionPlaceholder = () => {
	return (
		<DomainSearchSkipSuggestionSkeleton
			role="status"
			aria-busy="true"
			aria-label={ __( 'Loading free domain suggestion' ) }
			title={ <LoadingPlaceholder width="11.625rem" height="1.25rem" /> }
			subtitle={ <LoadingPlaceholder width="14.3125rem" height="0.5rem" /> }
			right={ <LoadingPlaceholder width="7.4375rem" height="2.5rem" /> }
		/>
	);
};

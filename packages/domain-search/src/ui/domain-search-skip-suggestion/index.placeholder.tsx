import { LoadingPlaceholder } from '@automattic/components';
import { DomainSearchSkipSuggestionSkeleton } from './index.skeleton';

export const DomainSearchSkipSuggestionPlaceholder = () => {
	return (
		<DomainSearchSkipSuggestionSkeleton
			title={ <LoadingPlaceholder width="11.625rem" height="1.25rem" /> }
			subtitle={ <LoadingPlaceholder width="14.3125rem" height="0.5rem" /> }
			right={ <LoadingPlaceholder width="7.4375rem" height="2.5rem" /> }
		/>
	);
};

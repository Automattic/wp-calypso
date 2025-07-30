import { LoadingPlaceholder } from '@automattic/components';
import { SuggestionSkeleton } from './index.skeleton';

export const SuggestionPlaceholder = () => (
	<SuggestionSkeleton
		domainName={ <LoadingPlaceholder width="11.625rem" height="1.5rem" /> }
		price={ <LoadingPlaceholder width="6.5rem" height="1rem" /> }
		cta={ <LoadingPlaceholder width="2.5rem" height="2.5rem" /> }
	/>
);

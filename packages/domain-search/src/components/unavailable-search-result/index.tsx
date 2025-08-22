import { DomainSuggestionItem } from '../../ui';

export const UnavailableSearchResult = () => {
	return (
		<DomainSuggestionItem.Unavailable domain="example" tld="app" reason="already-registered" />
	);
};

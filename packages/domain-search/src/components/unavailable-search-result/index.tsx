import { DomainSuggestion } from '../../ui';

export const UnavailableSearchResult = () => {
	return <DomainSuggestion.Unavailable domain="example" tld="app" reason="already-registered" />;
};

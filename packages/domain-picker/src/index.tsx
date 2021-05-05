/**
 * Internal dependencies
 */
export { default } from './components';
export type { Props } from './components';

export {
	SUGGESTION_ITEM_TYPE_BUTTON,
	SUGGESTION_ITEM_TYPE_RADIO,
	SUGGESTION_ITEM_TYPE_INDIVIDUAL,
} from './components/domain-suggestion-item';

export type { SUGGESTION_ITEM_TYPE } from './components/domain-suggestion-item';

export {
	mockDomainSuggestion,
	isGoodDefaultDomainQuery,
	getDomainSuggestionsVendor,
} from './utils';
export { useDomainSuggestions } from './hooks';
export { DOMAIN_QUERY_MINIMUM_LENGTH } from './constants';

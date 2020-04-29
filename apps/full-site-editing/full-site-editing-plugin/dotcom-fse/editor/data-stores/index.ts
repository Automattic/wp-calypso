/**
 * External dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';

export type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	// @TODO: Where does this come from in WP Admin? `fullSiteEditing` global?
	vendor: 'variation2_front',
} );

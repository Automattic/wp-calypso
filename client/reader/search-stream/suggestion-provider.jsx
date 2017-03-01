/**
 * External Dependencies
 */
import React from 'react';
import { map, sampleSize } from 'lodash';

/**
 * Internal Dependencies
 */
import TagSubscriptions from 'lib/reader-tags/subscriptions';
import i18nUtils from 'lib/i18n-utils';
import { suggestions } from 'reader/search-stream/suggestions';

export default ( Element, count = 3 ) => {
	return class SuggestionsListener extends React.Component {

		state = {
			suggestions: this.getSuggestions()
		}

		componentWillMount() {
			TagSubscriptions.on( 'change', this.handleChange );
		}

		componentWillUnmount() {
			TagSubscriptions.off( 'change', this.handleChange );
		}

		suggestionsFromTags() {
			const tags = TagSubscriptions.get();
			if ( tags ) {
				if ( tags.length <= count ) {
					return [];
				}
				return map( sampleSize( tags, count ), tag => ( tag.display_name || tag.slug ).replace( /-/g, ' ' ) );
			}
			return null;
		}

		suggestionsFromPicks() {
			const lang = i18nUtils.getLocaleSlug();
			if ( suggestions[ lang ] ) {
				return sampleSize( suggestions[ lang ], count );
			}
			return null;
		}

		getSuggestions() {
			const tagSuggestions = this.suggestionsFromTags();
			if ( tagSuggestions === null ) {
				return null;
			}

			if ( tagSuggestions.length ) {
				return tagSuggestions;
			}

			return this.suggestionsFromPicks();
		}

		handleChange = () => {
			this.setState( {
				suggestions: this.getSuggestions()
			} );
		}

		render() {
			return <Element { ...this.props } suggestions={ this.state.suggestions } />;
		}
	};
};

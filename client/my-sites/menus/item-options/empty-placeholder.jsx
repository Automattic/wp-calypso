/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Component
 */
class EmptyPlaceholder extends Component {
	static propTypes = {
		typeName: PropTypes.string.isRequired,
		createLink: PropTypes.string.isRequired,
		notFoundLabel: PropTypes.string,
		isSearch: PropTypes.bool
	};

	static defaultProps = {
		isSearch: false
	};

	createOptionMessage() {
		const { createLink, translate, typeName } = this.props;
		switch ( typeName ) {
			case 'category':
				return translate( 'You may want to {{a}}create a new category{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no categories match the given search, or if there are no categories at all.',
					components: {
						a: <a className="create-link" href={ createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post_tag':
				return translate( 'You may want to {{a}}create a new tag{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no tags match the given search, or if there are no tags at all.',
					components: {
						a: <a className="create-link" href={ createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post':
				return translate( 'You may want to {{a}}create a new post{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no posts match the given search, or if there are no posts at all.',
					components: {
						a: <a className="create-link" href={ createLink } />
					}
				} );
			case 'page':
				return translate( 'You may want to {{a}}create a new page{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no pages match the given search, or if there are no pages at all.',
					components: {
						a: <a className="create-link" href={ createLink } />
					}
				} );
			default:
				return translate( 'You may want to {{a}}create a new one{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no results are found for the given search, or if there are no results of the given item type.',
					components: {
						a: <a className="create-link" href={ createLink } />
					}
				} );
		}
	}

	noOptionsMessage() {
		const { notFoundLabel, translate, typeName } = this.props;
		const messages = {
			page: translate( 'No pages found.' ),
			category: translate( 'No categories found.' ),
			post_tag: translate( 'No tags found.' ),
			post_format: translate( 'No post formats found.' ),
			post: translate( 'No posts found.' ),
		};

		return typeName in messages ? messages[ typeName ] : notFoundLabel;
	}

	noSearchResultsMessage() {
		return this.props.translate( 'No results. Please try a different search.' );
	}

	render() {
		return (
			<span className="is-empty-content">
				{ this.props.isSearch
					? this.noSearchResultsMessage()
					: this.noOptionsMessage()
				}
				&nbsp;
				{ this.props.typeName !== 'post_tag' && this.createOptionMessage() }
			</span>
		);
	}
}

export default localize( EmptyPlaceholder );

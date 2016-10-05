/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Component
 */
const EmptyPlaceholder = React.createClass( {
	propTypes: {
		typeName: PropTypes.string.isRequired,
		typeFamily: PropTypes.string.isRequired,
		createLink: PropTypes.string.isRequired,
		isSearch: PropTypes.bool
	},

	getDefaultProps() {
		return {
			isSearch: false
		};
	},

	createOptionMessage() {
		switch ( this.props.typeName ) {
			case 'category':
				return this.translate( 'You may want to {{a}}create a new category{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no categories match the given search, or if there are no categories at all.',
					components: {
						a: <a className="create-link" href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post_tag':
				return this.translate( 'You may want to {{a}}create a new tag{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no tags match the given search, or if there are no tags at all.',
					components: {
						a: <a className="create-link" href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post':
				return this.translate( 'You may want to {{a}}create a new post{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no posts match the given search, or if there are no posts at all.',
					components: {
						a: <a className="create-link" href={ this.props.createLink } />
					}
				} );
			case 'page':
				return this.translate( 'You may want to {{a}}create a new page{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no pages match the given search, or if there are no pages at all.',
					components: {
						a: <a className="create-link" href={ this.props.createLink } />
					}
				} );
			default:
				return this.translate( 'You may want to {{a}}create a new one{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'Used when no results are found for the given search, or if there are no results of the given item type.',
					components: {
						a: <a className="create-link" href={ this.props.createLink } />
					}
				} );
		}
	},

	noOptionsMessage() {
		return this.props.notFoundLabel;
	},

	noSearchResultsMessage() {
		return this.translate( 'No results. Please try a different search.' );
	},

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
	},
} );

export default EmptyPlaceholder;

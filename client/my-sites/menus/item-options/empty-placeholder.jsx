/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Component
 */
var EmptyPlaceholder = React.createClass( {
	propTypes: {
		typeName: React.PropTypes.string.isRequired,
		createLink: React.PropTypes.string.isRequired,
		isSearch: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			isSearch: false
		};
	},

	createOptionMessage: function() {
		switch ( this.props.typeName ) {
			case 'category':
				return this.translate( 'You may want to {{a}}create a new category{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'This is used when no categories match the given search, or if there are no categories at all.',
					components: {
						a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post_tag':
				return this.translate( 'You may want to {{a}}create a new tag{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'This is used when no tags match the given search, or if there are no tags at all.',
					components: {
						a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'post':
				return this.translate( 'You may want to {{a}}create a new post{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'This is used when no posts match the given search, or if there are no posts at all.',
					components: {
						a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			case 'page':
				return this.translate( 'You may want to {{a}}create a new page{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'This is used when no pages match the given search, or if there are no pages at all.',
					components: {
						a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
			default:
				return this.translate( 'You may want to {{a}}create a new one{{/a}}.', {
					context: 'Menus: item search/listing results',
					comment: 'This is used when no results are found for the given search, or if there are no results of the given item type at all.',
					components: {
						a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
					}
				} );
		}
	},

	noOptionsMessage: function() {
		return this.translate( 'Nothing found.' );
	},

	noSearchResultsMessage: function() {
		return this.translate( 'No results. Please try a different search.' );
	},

	render: function() {
		return (
			<span className='is-empty-content'>
				{ this.props.isSearch ? this.noSearchResultsMessage() : this.noOptionsMessage() }
				&nbsp;{ this.createOptionMessage() }
			</span>
		);
	},
} );

module.exports = EmptyPlaceholder;

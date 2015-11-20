/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Component
 */
module.exports = React.createClass( {
	displayName: 'CategorySelectorNoResults',

	propTypes: {
		createLink: React.PropTypes.string
	},

	render: function() {
		var createMessage,
			noResultsMessage;

		noResultsMessage = this.translate( 'No results. Please try a different search.' );

		if ( this.props.createLink ) {
			createMessage = this.translate( 'You may want to {{a}}create a new category{{/a}}.', {
				context: 'Menus: item search/listing results',
				comment: 'This is used when no categories match the given search, or if there are no categories at all.',
				components: {
					a: <a className='create-link' href={ this.props.createLink } target="_blank" />
				}
			} );
		}

		return (
			<span className='is-empty-content'>
				{ noResultsMessage }
				&nbsp;{ createMessage }
			</span>
		);
	},
} );

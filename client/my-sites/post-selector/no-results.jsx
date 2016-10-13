/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'PostSelectorNoResults',

	propTypes: {
		createLink: PropTypes.string
	},

	render() {
		let createMessage;
		let noResultsMessage;

		noResultsMessage = this.translate( 'No results. Please try a different search.' );

		if ( this.props.createLink ) {
			createMessage = this.translate( 'You may want to {{a}}create a new page{{/a}}.', {
				context: 'Menus: item search/listing results',
				comment: 'This is used when no posts or pages match the given search.',
				components: {
					a: <a className='create-link' href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
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

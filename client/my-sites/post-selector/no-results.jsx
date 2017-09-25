/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

import { localize } from 'i18n-calypso';

export default localize( React.createClass( {
	displayName: 'PostSelectorNoResults',

	propTypes: {
		createLink: PropTypes.string
	},

	render() {
		let createMessage;
		let noResultsMessage;

		noResultsMessage = this.props.translate( 'No results. Please try a different search.' );

		if ( this.props.createLink ) {
			createMessage = this.props.translate( 'You may want to {{a}}create a new page{{/a}}.', {
				context: 'Menus: item search/listing results',
				comment: 'This is used when no posts or pages match the given search.',
				components: {
					a: <a className="create-link" href={ this.props.createLink } target="_blank" rel="noopener noreferrer" />
				}
			} );
		}

		return (
			<span className="is-empty-content">
				{ noResultsMessage }
				&nbsp;{ createMessage }
			</span>
		);
	},
} ) );

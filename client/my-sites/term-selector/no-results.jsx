/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import { localize } from 'i18n-calypso';

class TermSelectorNoResults extends PureComponent {
	constructor( props ) {
		super( props );
	}

	render() {
		const { createLink, translate } = this.props;
		let createMessage;
		let noResultsMessage = translate( 'No results. Please try a different search.' );

		if ( createLink ) {
			createMessage = translate( 'You may want to {{a}}create a new category{{/a}}.', {
				context: 'Menus: item search/listing results',
				comment: 'This is used when no categories match the given search, or if there are no categories at all.',
				components: {
					a: <a className="create-link" href={ createLink } target="_blank" />
				}
			} );
		}

		return (
			<span className="is-empty-content">
				{ noResultsMessage }
				&nbsp;{ createMessage }
			</span>
		);
	}
}

TermSelectorNoResults.propTypes = {
	createLink: PropTypes.string,
	translate: PropTypes.func
};

export default localize( TermSelectorNoResults );

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default React.createClass( {
	displayName: 'TermTreeSelectorNoResults',

	mixins: [ PureRenderMixin ],

	propTypes: {
		createLink: PropTypes.string
	},

	render() {
		const { createLink } = this.props;
		let createMessage;

		if ( createLink ) {
			createMessage = this.translate( 'You may want to {{a}}create a new category{{/a}}.', {
				context: 'Menus: item search/listing results',
				comment: 'This is used when no categories match the given search, or if there are no categories at all.',
				components: {
					a: <a className="create-link" href={ createLink } target="_blank" />
				}
			} );
		}

		return (
			<span className="is-empty-content">
				{ this.translate( 'No results. Please try a different search.' ) }
				&nbsp;{ createMessage }
			</span>
		);
	}
} );

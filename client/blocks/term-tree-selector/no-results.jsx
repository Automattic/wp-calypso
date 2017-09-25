/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

export default localize( class extends React.PureComponent {
	static displayName = 'TermTreeSelectorNoResults';

	static propTypes = {
		createLink: PropTypes.string
	};

	render() {
		const { createLink } = this.props;
		let createMessage;

		if ( createLink ) {
			createMessage = this.props.translate( 'You may want to {{a}}create a new item{{/a}}.', {
				context: 'Term Selector: term search/listing results',
				comment: 'This is used when no terms match the given search, or if there are no terms at all.',
				components: {
					a: <a className="create-link" href={ createLink } target="_blank" rel="noopener noreferrer" />
				}
			} );
		}

		return (
		    <span className="is-empty-content">
				{ this.props.translate( 'No results. Please try a different search.' ) }
				&nbsp;{ createMessage }
			</span>
		);
	}
} );

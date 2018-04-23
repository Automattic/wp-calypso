/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */

import Button from 'components/button';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSearchQuery } from 'state/inline-help/selectors';

class InlineHelpRichResult extends Component {
	static propTypes = {
		result: PropTypes.object,
	};

	handleClick = event => {
		const href = event.target.href;
		if ( ! href ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_inlinehelp_link_open', {
			search_query: this.props.searchQuery,
			result_url: href,
		} );
	};

	render() {
		const { translate, result } = this.props;
		const { title, description, link } = result;
		const classes = classNames( 'inline-help__richresult__title' );
		return (
			<div>
				<h2 className={ classes }>{ preventWidows( decodeEntities( title ) ) }</h2>
				<p> { decodeEntities( description ) } </p>
				<Button primary onClick={ this.handleClick } href={ link }>
					{ translate( 'Read More' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	state => ( {
		searchQuery: getSearchQuery( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( InlineHelpRichResult ) );

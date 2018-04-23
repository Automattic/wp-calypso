/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { omitBy, isUndefined } from 'lodash';

/**
 * Internal Dependencies
 */

import Button from 'components/button';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSearchQuery } from 'state/inline-help/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class InlineHelpRichResult extends Component {
	static propTypes = {
		result: PropTypes.object,
	};

	state = {
		type: this.props.result.type || 'article',
	};

	handleClick = event => {
		event.preventDefault();
		const { href } = event.target;
		const { type } = this.state;
		const { tour } = this.props.result;
		const tracksData = omitBy(
			{
				search_query: this.props.searchQuery,
				tour,
				result_url: href,
			},
			isUndefined
		);

		this.props.recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData );

		if ( type === 'tour' ) {
			this.props.requestGuidedTour( tour );
		} else if ( type === 'video' ) {
			//here be dragons
		} else {
			if ( ! href ) {
				return;
			}
			if ( event.metaKey ) {
				window.open( href, '_blank' );
			} else {
				window.location = href;
			}
		}
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
					{
						{
							article: translate( 'Read More' ),
							video: translate( 'Watch Video' ),
							tour: translate( 'Start Tour' ),
						}[ this.state.type ]
					}
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
		requestGuidedTour,
	}
)( localize( InlineHelpRichResult ) );

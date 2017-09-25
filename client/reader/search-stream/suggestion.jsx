/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { recordTrack, recordTracksRailcarInteract } from 'reader/stats';

export class Suggestion extends Component {
	static propTypes = {
		suggestion: PropTypes.string.isRequired,
		source: PropTypes.string,
		sort: PropTypes.string,
		railcar: PropTypes.object,
	};

	componentWillMount() {
		const { railcar } = this.props;
		analytics.tracks.recordEvent( 'calypso_traintracks_render', railcar );
	}

	handleSuggestionClick = () => {
		const { suggestion, source, railcar } = this.props;
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion, source } );
		recordTracksRailcarInteract( 'search_suggestion_click', railcar );
	};

	render() {
		const { suggestion, sort } = this.props;
		const args = {
			isSuggestion: 1,
			q: suggestion,
			sort,
		};

		const searchUrl = '/read/search?' + stringify( args );

		return (
			<a onClick={ this.handleSuggestionClick } href={ searchUrl }>
				{ suggestion }
			</a>
		);
	}
}

export default Suggestion;

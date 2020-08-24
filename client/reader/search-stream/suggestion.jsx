/**
 * External Dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'qs';

/**
 * Internal Dependencies
 */
import { recordTrack, recordTracksRailcarInteract } from 'reader/stats';
import { recordTracksEvent } from 'lib/analytics/tracks';

export class Suggestion extends Component {
	static propTypes = {
		suggestion: PropTypes.string.isRequired,
		source: PropTypes.string,
		sort: PropTypes.string,
		railcar: PropTypes.object,
	};

	componentDidMount() {
		const { railcar } = this.props;
		recordTracksEvent( 'calypso_traintracks_render', railcar );
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

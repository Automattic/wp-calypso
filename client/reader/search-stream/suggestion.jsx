/**
 * External Dependencies
 */
import React, { PropTypes, Component } from 'react';
import { stringify } from 'qs';

/**
 * Internal Dependencies
 */
import { recordTrack } from 'reader/stats';
import analytics from 'lib/analytics';

export class Suggestion extends Component {
	static propTypes = {
		suggestion: PropTypes.string.isRequired,
		source: PropTypes.string,
		sort: PropTypes.string,
		railcar: PropTypes.object
	};

	componentWillMount() {
		const { railcar } = this.props;
		analytics.tracks.recordEvent( 'calypso_traintracks_render', railcar );
	}

	handleSuggestionClick = () => {
		const { suggestion, source, railcar } = this.props;
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion, source } );
		analytics.tracks.recordEvent( 'calypso_traintracks_interact', railcar );
	};

	render() {
		const { suggestion, sort } = this.props;
		const args = {
			isSuggestion: 1,
			q: suggestion,
			sort
		};

		const searchUrl = '/read/search?' + stringify( args );

		return (
			<a onClick={ this.handleSuggestionClick }
				href={ searchUrl } >
				{ suggestion }
			</a>
		);
	}
}

export default Suggestion;

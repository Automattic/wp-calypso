import { retrieveLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordTracksRailcarInteract } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

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
		this.props.recordReaderTracksEvent( 'calypso_reader_search_suggestion_click', {
			suggestion,
			source,
		} );
		recordTracksRailcarInteract( 'search_suggestion_click', railcar );
	};

	render() {
		const { suggestion, sort } = this.props;
		const args = {
			isSuggestion: 1,
			q: suggestion,
			sort,
		};
		const localeFromPath = retrieveLocaleFromPathLocaleInFront( window.location.pathname );

		const searchUrl = localeFromPath
			? `/${ localeFromPath }/reader/search?${ stringify( args ) }`
			: `/reader/search?${ stringify( args ) }`;

		return (
			<a onClick={ this.handleSuggestionClick } href={ searchUrl }>
				{ suggestion }
			</a>
		);
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( Suggestion );

/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { initial, flatMap, trim } from 'lodash';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import CompactCard from 'components/card/compact';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import Suggestion from 'reader/search-stream/suggestion';
import SuggestionProvider from 'reader/search-stream/suggestion-provider';
import FollowingIntro from './intro';
import config from 'config';
import MaterialButton from '@material/react-button';
import MaterialTextField, { Input } from '@material/react-text-field';

function handleSearch( query ) {
	recordTrack( 'calypso_reader_search_from_following', {
		query,
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
}

class LilComponent extends React.Component {
	state = { value: '' };

	changeHandler = e => this.setState( { value: e.target.value } );

	render() {
		return (
			<MaterialTextField label="Dog">
				<Input value={ this.state.value } onChange={ this.changeHandler } />
			</MaterialTextField>
		);
	}
}

const FollowingStream = props => {
	const suggestionList =
		props.suggestions &&
		initial(
			flatMap( props.suggestions, query => [
				<Suggestion suggestion={ query.text } source="following" railcar={ query.railcar } />,
				', ',
			] )
		);

	return (
		<Stream { ...props }>
			{ config.isEnabled( 'reader/following-intro' ) && <FollowingIntro /> }
			<MaterialButton className="following__button">Howdy</MaterialButton>
			<LilComponent />
			<CompactCard className="following__search">
				<SearchInput
					onSearch={ handleSearch }
					autoFocus={ false }
					delaySearch={ true }
					delayTimeout={ 500 }
					placeholder={ props.translate( 'Search billions of WordPress posts…' ) }
				/>
			</CompactCard>
			<div className="search-stream__blank-suggestions">
				{ suggestionList &&
					props.translate( 'Suggestions: {{suggestions /}}.', {
						components: {
							suggestions: suggestionList,
						},
					} ) }&nbsp;
			</div>
		</Stream>
	);
};

export default SuggestionProvider( localize( FollowingStream ) );

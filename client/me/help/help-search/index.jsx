/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpSearchStore from 'lib/help-search/store';
import HelpSearchActions from 'lib/help-search/actions';
import HelpResults from 'me/help/help-results';
import NoResults from 'my-sites/no-results';
import SearchCard from 'components/search-card';
import CompactCard from 'components/card/compact';
import analytics from 'lib/analytics';
import { getForumUrl } from 'lib/i18n-utils';

class HelpSearch extends React.PureComponent {
	static displayName = 'HelpSearch';

	state = {
		helpLinks: [],
		searchQuery: '',
	};

	componentDidMount() {
		HelpSearchStore.on( 'change', this.refreshHelpLinks );
	}

	componentWillUnmount() {
		HelpSearchStore.removeListener( 'change', this.refreshHelpLinks );
	}

	refreshHelpLinks = () => {
		this.setState( { helpLinks: HelpSearchStore.getHelpLinks() } );
	};

	onSearch = searchQuery => {
		this.setState( { helpLinks: [], searchQuery: searchQuery } );
		analytics.tracks.recordEvent( 'calypso_help_search', { query: searchQuery } );
		HelpSearchActions.fetch( searchQuery );
	};

	displaySearchResults = () => {
		if ( isEmpty( this.state.searchQuery ) ) {
			return null;
		}

		if ( isEmpty( this.state.helpLinks ) ) {
			return (
				<div className="help-results__placeholder">
					<HelpResults
						header="Dummy documentation header"
						helpLinks={ [
							{
								title: '',
								description: '',
								link: '#',
								disabled: true,
							},
						] }
						footer="Dummy documentation footer"
						iconTypeDescription=""
						searchLink="#"
					/>
				</div>
			);
		}

		if (
			isEmpty( this.state.helpLinks.wordpress_support_links ) &&
			isEmpty( this.state.helpLinks.wordpress_forum_links ) &&
			isEmpty( this.state.helpLinks.jetpack_support_links )
		) {
			return (
				<CompactCard className="help-search__no-results">
					<NoResults
						text={ this.props.translate( 'No results found for {{em}}%(searchQuery)s{{/em}}', {
							args: { searchQuery: this.state.searchQuery },
							components: { em: <em /> },
						} ) }
					/>
				</CompactCard>
			);
		}

		return (
			<div>
				<HelpResults
					header={ this.props.translate( 'WordPress.com Documentation' ) }
					helpLinks={ this.state.helpLinks.wordpress_support_links }
					footer={ this.props.translate( 'See more from WordPress.com Documentation…' ) }
					iconTypeDescription="book"
					searchLink={ 'https://en.support.wordpress.com?s=' + this.state.searchQuery }
				/>
				<HelpResults
					header={ this.props.translate( 'Community Answers' ) }
					helpLinks={ this.state.helpLinks.wordpress_forum_links }
					footer={ this.props.translate( 'See more from Community Forum…' ) }
					iconTypeDescription="comment"
					searchLink={ getForumUrl() + '/search.php?search=' + this.state.searchQuery }
				/>
				<HelpResults
					header={ this.props.translate( 'Jetpack Documentation' ) }
					helpLinks={ this.state.helpLinks.jetpack_support_links }
					footer={ this.props.translate( 'See more from Jetpack Documentation…' ) }
					iconTypeDescription="jetpack"
					searchLink="https://jetpack.me/support/"
				/>
			</div>
		);
	};

	render() {
		return (
			<div className="help-search">
				<SearchCard
					onSearch={ this.onSearch }
					initialValue={ this.props.search }
					placeholder={ this.props.translate( 'How can we help?' ) }
					analyticsGroup="Help"
					delaySearch={ true }
				/>
				{ this.displaySearchResults() }
			</div>
		);
	}
}

export default localize( HelpSearch );

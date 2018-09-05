/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getHelpLinks from 'state/selectors/get-help-links';
import HelpResults from 'me/help/help-results';
import NoResults from 'my-sites/no-results';
import QueryHelpLinks from 'components/data/query-help-links';
import SearchCard from 'components/search-card';
import CompactCard from 'components/card/compact';
import { recordTracksEvent } from 'state/analytics/actions';
import { getForumUrl } from 'lib/i18n-utils';

export class HelpSearch extends React.PureComponent {
	static displayName = 'HelpSearch';

	state = {
		searchQuery: '',
	};

	onSearch = searchQuery => {
		this.setState( {
			searchQuery,
		} );
		recordTracksEvent( 'calypso_help_search', { query: searchQuery } );
	};

	displaySearchResults = () => {
		const { searchQuery } = this.state;
		const { helpLinks } = this.props;

		if ( isEmpty( searchQuery ) ) {
			return null;
		}

		if ( isEmpty( helpLinks ) ) {
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
			isEmpty( helpLinks.wordpress_support_links ) &&
			isEmpty( helpLinks.wordpress_forum_links ) &&
			isEmpty( helpLinks.wordpress_forum_links_localized ) &&
			isEmpty( helpLinks.jetpack_support_links )
		) {
			return (
				<CompactCard className="help-search__no-results">
					<NoResults
						text={ this.props.translate( 'No results found for {{em}}%(searchQuery)s{{/em}}', {
							args: { searchQuery },
							components: { em: <em /> },
						} ) }
					/>
				</CompactCard>
			);
		}

		const forumBaseUrl = helpLinks.wordpress_forum_links_localized
			? getForumUrl()
			: getForumUrl( 'en' );

		return (
			<div>
				<HelpResults
					header={ this.props.translate( 'WordPress.com Documentation' ) }
					helpLinks={ helpLinks.wordpress_support_links }
					footer={ this.props.translate( 'See more from WordPress.com Documentation…' ) }
					iconTypeDescription="book"
					searchLink={ 'https://en.support.wordpress.com?s=' + searchQuery }
				/>
				<HelpResults
					header={ this.props.translate( 'Community Answers' ) }
					helpLinks={ helpLinks.wordpress_forum_links_localized || helpLinks.wordpress_forum_links }
					footer={ this.props.translate( 'See more from Community Forum…' ) }
					iconTypeDescription="comment"
					searchLink={ `${ forumBaseUrl }/search/${ searchQuery }` }
				/>
				<HelpResults
					header={ this.props.translate( 'Jetpack Documentation' ) }
					helpLinks={ helpLinks.jetpack_support_links }
					footer={ this.props.translate( 'See more from Jetpack Documentation…' ) }
					iconTypeDescription="jetpack"
					searchLink="https://jetpack.me/support/"
				/>
			</div>
		);
	};

	render() {
		const { searchQuery } = this.state;

		return (
			<div className="help-search">
				<QueryHelpLinks query={ searchQuery } />
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

export default connect(
	state => ( {
		helpLinks: getHelpLinks( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( HelpSearch ) );

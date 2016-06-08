/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import isEmpty from 'lodash/isEmpty';
import { getLocaleSlug } from 'i18n-calypso';

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

module.exports = React.createClass( {
	displayName: 'HelpSearch',

	mixins: [ PureRenderMixin ],

	componentDidMount: function() {
		HelpSearchStore.on( 'change', this.refreshHelpLinks );
	},

	componentWillUnmount: function() {
		HelpSearchStore.removeListener( 'change', this.refreshHelpLinks );
	},

	getInitialState: function() {
		return {
			helpLinks: [],
			searchQuery: ''
		};
	},

	refreshHelpLinks: function() {
		this.setState( { helpLinks: HelpSearchStore.getHelpLinks() } );
	},

	onSearch: function( searchQuery ) {
		this.setState( { helpLinks: [], searchQuery: searchQuery } );
		analytics.tracks.recordEvent( 'calypso_help_search', { query: searchQuery } );
		HelpSearchActions.fetch( searchQuery );
	},

	displaySearchResults: function() {
		if ( isEmpty( this.state.searchQuery ) ) {
			return null;
		}

		if ( isEmpty( this.state.helpLinks ) ) {
			return (
				<div className="help-results__placeholder">
					<HelpResults
						header="Dummy documentation header"
						helpLinks={ [ {
							title: '',
							description: '',
							link: '#',
							disabled: true
						} ] }
						footer="Dummy documentation footer"
						iconTypeDescription=""
						searchLink="#" />
				</div>
			);
		}

		if ( isEmpty( this.state.helpLinks.wordpress_support_links ) && isEmpty( this.state.helpLinks.wordpress_forum_links ) && isEmpty( this.state.helpLinks.jetpack_support_links ) ) {
			return (
				<CompactCard className="help-search__no-results">
					<NoResults text={ this.translate( 'No results found for {{em}}%(searchQuery)s{{/em}}', { args: { searchQuery: this.state.searchQuery }, components: { em: <em /> } } ) } />
				</CompactCard>
			);
		}

		const localizedForumUrl = 'https://' + getLocaleSlug() + '.forums.wordpress.com';

		return (
			<div>
				<HelpResults
					header={ this.translate( 'WordPress.com Documentation' ) }
					helpLinks={ this.state.helpLinks.wordpress_support_links }
					footer={ this.translate( 'See more from WordPress.com Documentation…' ) }
					iconTypeDescription="book"
					searchLink={ 'https://en.support.wordpress.com?s=' + this.state.searchQuery } />
				<HelpResults
					header={ this.translate( 'Community Answers' ) }
					helpLinks={ this.state.helpLinks.wordpress_forum_links }
					footer={ this.translate( 'See more from Community Forum…' ) }
					iconTypeDescription="comment"
					searchLink={ localizedForumUrl + '/search.php?search=' + this.state.searchQuery } />
				<HelpResults
					header={ this.translate( 'Jetpack Documentation' ) }
					helpLinks={ this.state.helpLinks.jetpack_support_links }
					footer={ this.translate( 'See more from Jetpack Documentation…' ) }
					iconTypeDescription="jetpack"
					searchLink="https://jetpack.me/support/" />
			</div>
		);
	},

	render: function() {
		return (
			<div className="help-search">
				<SearchCard
					onSearch={ this.onSearch }
					initialValue={ this.props.search }
					placeholder={ this.translate( 'How can we help?' ) }
					analyticsGroup="Help"
					delaySearch={ true } />
				{ this.displaySearchResults() }
			</div>
		);
	}
} );

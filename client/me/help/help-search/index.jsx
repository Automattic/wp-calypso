/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

/**
 * Internal dependencies
 */
import HelpSearchStore from 'lib/help-search/store';
import HelpSearchActions from 'lib/help-search/actions';
import HelpResults from 'me/help/help-results';
import NoResults from 'my-sites/no-results';
import SearchCard from 'components/search-card';
import CompactCard from 'components/card/compact';

module.exports = React.createClass( {
	displayName: 'HelpSearch',

	mixins: [ React.addons.PureRenderMixin ],

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
						iconPathDescription=""
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

		return (
			<div>
				<HelpResults
					header={ this.translate( 'WordPress.com Documentation' ) }
					helpLinks={ this.state.helpLinks.wordpress_support_links }
					footer={ this.translate( 'See more from WordPress.com Documentation…' ) }
					iconPathDescription="M18.75 16.5h.75V3h-12c-1.656 0-3 1.344-3 3v12c0 1.656 1.344 3 3 3h12v-1.5h-.75c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5zm-11.25 3c-.828 0-1.5-.67-1.5-1.5s.672-1.5 1.5-1.5h9.585c-.36.4-.585.92-.585 1.5s.225 1.1.585 1.5H7.5z"
					searchLink={ 'https://en.support.wordpress.com?s=' + this.state.searchQuery } />
				<HelpResults
					header={ this.translate( 'Community Answers' ) }
					helpLinks={ this.state.helpLinks.wordpress_forum_links }
					footer={ this.translate( 'See more from Community Forum…' ) }
					iconPathDescription="M16.5 3h-12c-1.656 0-3 1.344-3 3v4.5c0 1.656 1.344 3 3 3H6v5.25l5.25-5.25h5.25c1.656 0 3-1.344 3-3V6c0-1.656-1.344-3-3-3zM21 6v4.5c0 2.48-2.02 4.5-4.5 4.5h-4.63l-1.5 1.5h3.88l5.25 5.25V16.5H21c1.656 0 3-1.344 3-3V9c0-1.656-1.344-3-3-3z"
					searchLink={ 'https://en.forums.wordpress.com/search.php?search=' + this.state.searchQuery } />
				<HelpResults
					header={ this.translate( 'Jetpack Documentation' ) }
					helpLinks={ this.state.helpLinks.jetpack_support_links }
					footer={ this.translate( 'See more from Jetpack Documentation…' ) }
					iconPathDescription="M12 1.5C6.15 1.5 1.5 6.15 1.5 12S6.15 22.5 12 22.5 22.5 17.85 22.5 12 17.85 1.5 12 1.5zM10.5 15l-3.45-.9c-.9-.15-1.35-1.2-.9-2.1l4.35-7.5V15zm7.35-3l-4.35 7.5V9l3.45.9c.9.15 1.35 1.2.9 2.1z"
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
					placeholder={ this.translate( 'Ask anything' ) }
					analyticsGroup="Help"
					delaySearch={ true } />
				{ this.displaySearchResults() }
			</div>
		);
	}
} );

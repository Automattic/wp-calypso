/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UrlSearch from 'lib/mixins/url-search';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

export default React.createClass( {
	mixins: [ UrlSearch ],

	render() {
		return (
			<SectionNav>
				<NavTabs>
					<NavItem selected={ true }>
						{ this.translate( 'Published', { context: 'Filter label for posts list' } ) }
					</NavItem>
				</NavTabs>
				<Search
					pinned={ true }
					onSearch={ this.doSearch }
					placeholder={ this.translate( 'Search…' ) }
					delaySearch={ true } />
			</SectionNav>
		);
	}
} );

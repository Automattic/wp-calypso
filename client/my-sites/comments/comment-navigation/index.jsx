/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';

export class CommentNavigation extends Component {
	state = {
		selectedTab: 'approved',
	};

	selectTab = tab => () => {
		if ( tab !== this.state.selectedTab ) {
			this.setState( { selectedTab: tab } );
		}
	}

	render() {
		const { translate } = this.props;
		const { selectedTab } = this.state;

		return (
			<SectionNav className="comment-navigation">
				<NavTabs>
					<NavItem
						onClick={ this.selectTab( 'pending' ) }
						selected={ 'pending' === selectedTab }
					>
						{ translate( 'Pending' ) }
					</NavItem>
					<NavItem
						count={ 15 }
						onClick={ this.selectTab( 'approved' ) }
						selected={ 'approved' === selectedTab }
					>
						{ translate( 'Approved' ) }
					</NavItem>
					<NavItem
						count={ 3 }
						onClick={ this.selectTab( 'spam' ) }
						selected={ 'spam' === selectedTab }
					>
						{ translate( 'Spam' ) }
					</NavItem>
					<NavItem
						onClick={ this.selectTab( 'trash' ) }
						selected={ 'trash' === selectedTab }
					>
						{ translate( 'Trash' ) }
					</NavItem>
					<NavItem
						count={ 18 }
						onClick={ this.selectTab( 'all' ) }
						selected={ 'all' === selectedTab }
					>
						{ translate( 'All' ) }
					</NavItem>
				</NavTabs>

				<Button compact>
					{ translate( 'Bulk Edit' ) }
				</Button>

				<Search
					fitsContainer
					pinned
				/>
			</SectionNav>
		);
	}
}

export default localize( CommentNavigation );

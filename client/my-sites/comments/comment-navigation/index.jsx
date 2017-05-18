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
	getStatusPath = status => ( status && 'approved' !== status )
		? `/comments/${ status }/${ this.props.siteSlug }`
		: `/comments/${ this.props.siteSlug }`;

	render() {
		const { status, translate } = this.props;

		return (
			<SectionNav className="comment-navigation">
				<NavTabs>
					<NavItem
						path={ this.getStatusPath( 'pending' ) }
						selected={ 'pending' === status }
					>
						{ translate( 'Pending' ) }
					</NavItem>
					<NavItem
						count={ 15 }
						path={ this.getStatusPath( 'approved' ) }
						selected={ ! status || 'approved' === status }
					>
						{ translate( 'Approved' ) }
					</NavItem>
					<NavItem
						count={ 3 }
						path={ this.getStatusPath( 'spam' ) }
						selected={ 'spam' === status }
					>
						{ translate( 'Spam' ) }
					</NavItem>
					<NavItem
						path={ this.getStatusPath( 'trash' ) }
						selected={ 'trash' === status }
					>
						{ translate( 'Trash' ) }
					</NavItem>
					<NavItem
						count={ 18 }
						path={ this.getStatusPath( 'all' ) }
						selected={ 'all' === status }
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

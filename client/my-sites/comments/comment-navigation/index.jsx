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

const DEFAULT_STATUS = 'pending';

export class CommentNavigation extends Component {
	getStatusPath = status => ( status && DEFAULT_STATUS !== status )
		? `/comments/${ status }/${ this.props.siteSlug }`
		: `/comments/${ this.props.siteSlug }`;

	isSelectedStatus = status => DEFAULT_STATUS === status
		? ! this.props.status || status === this.props.status
		: status === this.props.status;

	render() {
		const { translate } = this.props;

		return (
			<SectionNav className="comment-navigation">
				<NavTabs>
					<NavItem
						path={ this.getStatusPath( 'pending' ) }
						selected={ this.isSelectedStatus( 'pending' ) }
					>
						{ translate( 'Pending' ) }
					</NavItem>
					<NavItem
						count={ 15 }
						path={ this.getStatusPath( 'approved' ) }
						selected={ this.isSelectedStatus( 'approved' ) }
					>
						{ translate( 'Approved' ) }
					</NavItem>
					<NavItem
						count={ 3 }
						path={ this.getStatusPath( 'spam' ) }
						selected={ this.isSelectedStatus( 'spam' ) }
					>
						{ translate( 'Spam' ) }
					</NavItem>
					<NavItem
						path={ this.getStatusPath( 'trash' ) }
						selected={ this.isSelectedStatus( 'trash' ) }
					>
						{ translate( 'Trash' ) }
					</NavItem>
					<NavItem
						count={ 18 }
						path={ this.getStatusPath( 'all' ) }
						selected={ this.isSelectedStatus( 'all' ) }
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

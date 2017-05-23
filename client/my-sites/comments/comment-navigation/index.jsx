/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import UrlSearch from 'lib/url-search';
import Button from 'components/button';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';

export class CommentNavigation extends Component {
	static defaultProps = {
		status: 'pending',
	};

	getNavItems = () => {
		const { translate } = this.props;

		return {
			pending: {
				label: translate( 'Pending' ),
			},
			approved: {
				label: translate( 'Approved' ),
			},
			spam: {
				label: translate( 'Spam' ),
			},
			trash: {
				label: translate( 'Trash' ),
			},
			all: {
				label: translate( 'All' ),
			},
		};
	}

	getStatusPath = status => 'pending' !== status
		? `/comments/${ status }/${ this.props.siteSlug }`
		: `/comments/${ this.props.siteSlug }`;

	render() {
		const {
			doSearch,
			query,
			translate,
		} = this.props;

		return (
			<SectionNav className="comment-navigation">
				<NavTabs>
					{ map( this.getNavItems(), ( { label }, status ) =>
						<NavItem
							key={ status }
							path={ this.getStatusPath( status ) }
							selected={ this.props.status === status }
						>
							{ label }
						</NavItem>
					) }
				</NavTabs>

				<Button compact>
					{ translate( 'Bulk Edit' ) }
				</Button>

				<Search
					delaySearch
					fitsContainer
					initialValue={ query }
					onSearch={ doSearch }
					pinned
				/>
			</SectionNav>
		);
	}
}

export default localize( UrlSearch( CommentNavigation ) );

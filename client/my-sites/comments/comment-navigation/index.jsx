/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import UrlSearch from 'lib/url-search';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Count from 'components/count';
import CommentNavigationTab from './comment-navigation-tab';
import FormCheckbox from 'components/forms/form-checkbox';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';

export class CommentNavigation extends Component {
	static defaultProps = {
		selectedCount: 0,
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
			selectedCount,
			doSearch,
			isBulkEdit,
			query,
			status: queryStatus,
			toggleBulkEdit,
			translate,
		} = this.props;

		const navItems = this.getNavItems();

		if ( isBulkEdit ) {
			return (
			<SectionNav className="comment-navigation is-bulk-edit">
				<CommentNavigationTab>
					<FormCheckbox />
					<Count count={ selectedCount } />
				</CommentNavigationTab>
				<CommentNavigationTab className="comment-navigation__actions">
					<ButtonGroup>
						<Button compact>
							{ translate( 'Approve' ) }
						</Button>
						<Button compact>
							{ translate( 'Unapprove' ) }
						</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button compact>
							{ translate( 'Spam' ) }
						</Button>
						<Button compact>
							{ translate( 'Trash' ) }
						</Button>
					</ButtonGroup>
				</CommentNavigationTab>
				<CommentNavigationTab className="comment-navigation__close-bulk">
					<a onClick={ toggleBulkEdit }>
						<Gridicon icon="cross" />
					</a>
				</CommentNavigationTab>
			</SectionNav>
			);
		}

		return (
			<SectionNav className="comment-navigation" selectedText={ navItems[ queryStatus ].label }>
				<NavTabs selectedText={ navItems[ queryStatus ].label }>
					{ map( navItems, ( { label }, status ) =>
						<NavItem
							key={ status }
							path={ this.getStatusPath( status ) }
							selected={ queryStatus === status }
						>
							{ label }
						</NavItem>
					) }
				</NavTabs>

				<CommentNavigationTab className="comment-navigation__actions">
					<Button compact onClick={ toggleBulkEdit }>
						{ translate( 'Bulk Edit' ) }
					</Button>
				</CommentNavigationTab>

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

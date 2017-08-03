/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes, map } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Count from 'components/count';
import CommentNavigationTab from './comment-navigation-tab';
import FormCheckbox from 'components/forms/form-checkbox';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import UrlSearch from 'lib/url-search';
import { isEnabled } from 'config';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

const bulkActions = {
	unapproved: [ 'approve', 'spam', 'trash' ],
	approved: [ 'unapprove', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
	all: [ 'approve', 'unapprove', 'spam', 'trash' ],
};

export class CommentNavigation extends Component {
	static defaultProps = {
		isSelectedAll: false,
		selectedCount: 0,
		status: 'unapproved',
	};

	changeFilter = status => () => this.props.recordChangeFilter( status );

	getNavItems = () => {
		const { translate } = this.props;
		const navItems = {
			unapproved: {
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
		};

		if ( isEnabled( 'comments/management/all-list' ) ) {
			navItems.all = {
				label: translate( 'All' ),
			};
		}

		return navItems;
	}

	getStatusPath = status => 'unapproved' !== status
		? `/comments/${ status }/${ this.props.siteFragment }`
		: `/comments/pending/${ this.props.siteFragment }`;

	statusHasAction = action => includes( bulkActions[ this.props.status ], action );

	render() {
		const {
			doSearch,
			hasSearch,
			isBulkEdit,
			isSelectedAll,
			query,
			selectedCount,
			setBulkStatus,
			status: queryStatus,
			toggleBulkEdit,
			toggleSelectAll,
			translate,
		} = this.props;

		const navItems = this.getNavItems();

		if ( isBulkEdit ) {
			return (
			<SectionNav className="comment-navigation is-bulk-edit">
				<CommentNavigationTab className="comment-navigation__bulk-count">
					<FormCheckbox
						checked={ isSelectedAll }
						onChange={ toggleSelectAll }
					/>
					<Count count={ selectedCount } />
				</CommentNavigationTab>
				<CommentNavigationTab className="comment-navigation__actions">
					<ButtonGroup>
						{ this.statusHasAction( 'approve' ) &&
							<Button
								compact
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'approved' ) }
							>
								{ translate( 'Approve' ) }
							</Button>
						}
						{ this.statusHasAction( 'unapprove' ) &&
							<Button
								compact
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'unapproved' ) }
							>
								{ translate( 'Unapprove' ) }
							</Button>
						}
					</ButtonGroup>
					<ButtonGroup>
						{ this.statusHasAction( 'spam' ) &&
							<Button
								compact
								scary
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'spam' ) }
							>
								{ translate( 'Spam' ) }
							</Button>
						}
						{ this.statusHasAction( 'trash' ) &&
							<Button
								compact
								scary
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'trash' ) }
							>
								{ translate( 'Trash' ) }
							</Button>
						}
						{ this.statusHasAction( 'delete' ) &&
							<Button
								compact
								scary
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'delete' ) }
							>
								{ translate( 'Delete' ) }
							</Button>
						}
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
							onClick={ this.changeFilter( status ) }
							path={ this.getStatusPath( status ) }
							selected={ queryStatus === status }
						>
							{ label }
						</NavItem>
					) }
				</NavTabs>

				{ isEnabled( 'manage/comments/bulk-actions' ) &&
					<CommentNavigationTab className="comment-navigation__actions comment-navigation__open-bulk">
						<Button compact onClick={ toggleBulkEdit }>
							{ translate( 'Bulk Edit' ) }
						</Button>
					</CommentNavigationTab>
				}

				{ hasSearch &&
					<Search
						delaySearch
						fitsContainer
						initialValue={ query }
						onSearch={ doSearch }
						pinned
					/>
				}
			</SectionNav>
		);
	}
}

const mapDispatchToProps = {
	recordChangeFilter: status => composeAnalytics(
		recordTracksEvent( 'calypso_comment_management_change_filter', { status } ),
		bumpStat( 'calypso_comment_management', 'change_filter_to_' + status )
	),
};

export default connect( null, mapDispatchToProps )( localize( UrlSearch( CommentNavigation ) ) );

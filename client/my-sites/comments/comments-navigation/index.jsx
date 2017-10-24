/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { get, includes, isUndefined, map } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import ControlItem from 'components/segmented-control/item';
import Count from 'components/count';
import CommentsNavigationTab from './comments-navigation-tab';
import FormCheckbox from 'components/forms/form-checkbox';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import SegmentedControl from 'components/segmented-control';
import UrlSearch from 'lib/url-search';
import { isEnabled } from 'config';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSiteComment } from 'state/selectors';
import { NEWEST_FIRST, OLDEST_FIRST } from '../constants';

const bulkActions = {
	unapproved: [ 'approve', 'spam', 'trash' ],
	approved: [ 'unapprove', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
	all: [ 'approve', 'unapprove', 'spam', 'trash' ],
};

export class CommentsNavigation extends Component {
	static defaultProps = {
		isSelectedAll: false,
		selectedCount: 0,
		status: 'unapproved',
		sortOrder: NEWEST_FIRST,
	};

	bulkDeletePermanently = () => {
		const { setBulkStatus, translate } = this.props;
		if (
			isUndefined( window ) ||
			window.confirm( translate( 'Delete these comments permanently?' ) )
		) {
			setBulkStatus( 'delete' )();
		}
	};

	changeFilter = status => () => this.props.recordChangeFilter( status );

	getNavItems = () => {
		const { translate } = this.props;
		const navItems = {
			all: {
				label: translate( 'All' ),
			},
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

		return navItems;
	};

	getStatusPath = status =>
		'unapproved' !== status
			? `/comments/${ status }/${ this.props.siteFragment }`
			: `/comments/pending/${ this.props.siteFragment }`;

	statusHasAction = action => includes( bulkActions[ this.props.status ], action );

	toggleSelectAll = () => {
		if ( this.props.isSelectedAll ) {
			return this.props.toggleSelectAll( [] );
		}

		return this.props.toggleSelectAll( this.props.visibleComments );
	};

	render() {
		const {
			doSearch,
			hasSearch,
			isBulkEdit,
			isCommentsTreeSupported,
			isSelectedAll,
			query,
			selectedCount,
			setBulkStatus,
			setSortOrder,
			sortOrder,
			status: queryStatus,
			toggleBulkEdit,
			translate,
		} = this.props;

		const navItems = this.getNavItems();

		if ( isBulkEdit ) {
			return (
				<SectionNav className="comments-navigation is-bulk-edit">
					<CommentsNavigationTab className="comments-navigation__bulk-count">
						<FormCheckbox checked={ isSelectedAll } onChange={ this.toggleSelectAll } />
						<Count count={ selectedCount } />
					</CommentsNavigationTab>
					<CommentsNavigationTab className="comments-navigation__actions">
						<ButtonGroup>
							{ this.statusHasAction( 'approve' ) && (
								<Button
									compact
									disabled={ ! selectedCount }
									onClick={ setBulkStatus( 'approved' ) }
								>
									{ translate( 'Approve' ) }
								</Button>
							) }
							{ this.statusHasAction( 'unapprove' ) && (
								<Button
									compact
									disabled={ ! selectedCount }
									onClick={ setBulkStatus( 'unapproved' ) }
								>
									{ translate( 'Unapprove' ) }
								</Button>
							) }
						</ButtonGroup>
						<ButtonGroup>
							{ this.statusHasAction( 'spam' ) && (
								<Button
									compact
									scary
									disabled={ ! selectedCount }
									onClick={ setBulkStatus( 'spam' ) }
								>
									{ translate( 'Spam' ) }
								</Button>
							) }
							{ this.statusHasAction( 'trash' ) && (
								<Button
									compact
									scary
									disabled={ ! selectedCount }
									onClick={ setBulkStatus( 'trash' ) }
								>
									{ translate( 'Trash' ) }
								</Button>
							) }
							{ this.statusHasAction( 'delete' ) && (
								<Button
									compact
									scary
									disabled={ ! selectedCount }
									onClick={ this.bulkDeletePermanently }
								>
									{ translate( 'Delete' ) }
								</Button>
							) }
						</ButtonGroup>
					</CommentsNavigationTab>
					<CommentsNavigationTab className="comments-navigation__close-bulk">
						<a onClick={ toggleBulkEdit }>
							<Gridicon icon="cross" />
						</a>
					</CommentsNavigationTab>
				</SectionNav>
			);
		}

		return (
			<SectionNav className="comments-navigation" selectedText={ navItems[ queryStatus ].label }>
				<NavTabs selectedText={ navItems[ queryStatus ].label }>
					{ map( navItems, ( { label }, status ) => (
						<NavItem
							key={ status }
							onClick={ this.changeFilter( status ) }
							path={ this.getStatusPath( status ) }
							selected={ queryStatus === status }
						>
							{ label }
						</NavItem>
					) ) }
				</NavTabs>

				<CommentsNavigationTab className="comments-navigation__actions comments-navigation__open-bulk">
					{ isEnabled( 'comments/management/sorting' ) &&
					isCommentsTreeSupported && (
						<SegmentedControl compact className="comments-navigation__sort-buttons">
							<ControlItem
								onClick={ setSortOrder( NEWEST_FIRST ) }
								selected={ sortOrder === NEWEST_FIRST }
							>
								{ translate( 'Newest', {
									comment: 'Chronological order for sorting the comments list.',
								} ) }
							</ControlItem>
							<ControlItem
								onClick={ setSortOrder( OLDEST_FIRST ) }
								selected={ sortOrder === OLDEST_FIRST }
							>
								{ translate( 'Oldest', {
									comment: 'Chronological order for sorting the comments list.',
								} ) }
							</ControlItem>
						</SegmentedControl>
					) }

					<Button compact onClick={ toggleBulkEdit }>
						{ translate( 'Bulk Edit' ) }
					</Button>
				</CommentsNavigationTab>

				{ hasSearch && (
					<Search delaySearch fitsContainer initialValue={ query } onSearch={ doSearch } pinned />
				) }
			</SectionNav>
		);
	}
}

const mapStateToProps = ( state, { commentsPage, siteId } ) => {
	const visibleComments = map( commentsPage, commentId => {
		const comment = getSiteComment( state, siteId, commentId );
		if ( comment ) {
			return {
				commentId,
				isLiked: get( comment, 'i_like' ),
				postId: get( comment, 'post.ID' ),
				status: get( comment, 'status' ),
			};
		}
	} );

	return {
		visibleComments,
		isCommentsTreeSupported:
			! isJetpackSite( state, siteId ) || isJetpackMinimumVersion( state, siteId, '5.3' ),
	};
};

const mapDispatchToProps = {
	recordChangeFilter: status =>
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_change_filter', { status } ),
			bumpStat( 'calypso_comment_management', 'change_filter_to_' + status )
		),
};

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( UrlSearch( CommentsNavigation ) )
);

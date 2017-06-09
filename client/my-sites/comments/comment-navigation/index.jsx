/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes, map } from 'lodash';
import { connect } from 'react-redux';

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
import { routeTo } from 'state/ui/actions';

const bulkActions = {
	unapproved: [ 'approve', 'spam', 'trash' ],
	approved: [ 'unapprove', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
	all: [ 'approve', 'unapprove', 'spam', 'trash' ],
};

const STATUSES = [ 'unapproved', 'approved', 'spam', 'trash', 'all' ];

export class CommentNavigation extends Component {
	static defaultProps = {
		isSelectedAll: false,
		selectedCount: 0,
		status: 'unapproved',
	};

	getNavLabels = () => {
		const { translate } = this.props;

		return {
			unapproved: translate( 'Pending' ),
			approved: translate( 'Approved' ),
			spam: translate( 'Spam' ),
			trash: translate( 'Trash' ),
			all: translate( 'All' ),
		};
	};

	getNavItem = ( siteSlug ) => ( status ) => {
		const path = this.getStatusPath( status, siteSlug );
		return {
			onClick: this.routeToPath( path ),
			path,
			status,
		};
	};

	componentWillMount() {
		this.setState( {
			navItems: map( STATUSES, this.getNavItem( this.props.siteSlug ) )
		} );
	}

	componentWillReceiveProps( { siteSlug } ) {
		if ( this.props.siteSlug !== siteSlug ) {
			this.setState( {
				navItems: map( STATUSES, this.getNavItem( siteSlug ) )
			} );
		}
	}

	routeToPath = ( path ) => ( event ) => {
		event.preventDefault();
		this.props.routeTo( path );
	};

	getStatusPath = ( status, siteSlug ) => 'unapproved' !== status
		? `/comments/${ status }/${ siteSlug }`
		: `/comments/pending/${ siteSlug }`;

	statusHasAction = action => includes( bulkActions[ this.props.status ], action );

	render() {
		const {
			doSearch,
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

		const navLabels = this.getNavLabels();

		if ( isBulkEdit ) {
			return (
			<SectionNav className="comment-navigation is-bulk-edit">
				<CommentNavigationTab>
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
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'spam' ) }
							>
								{ translate( 'Spam' ) }
							</Button>
						}
						{ this.statusHasAction( 'trash' ) &&
							<Button
								compact
								disabled={ ! selectedCount }
								onClick={ setBulkStatus( 'trash' ) }
							>
								{ translate( 'Trash' ) }
							</Button>
						}
						{ this.statusHasAction( 'delete' ) &&
							<Button
								compact
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
			<SectionNav className="comment-navigation" selectedText={ navLabels[ queryStatus ] }>
				<NavTabs selectedText={ navLabels[ queryStatus ] }>
					{ map( this.state.navItems, ( { status, path, onClick } ) =>
						<NavItem
							key={ status }
							path={ path }
							selected={ queryStatus === status }
							onClick={ onClick }
						>
							{ navLabels[ status ] }
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

export default connect( null, {
	routeTo,
} )( localize( UrlSearch( CommentNavigation ) ) );

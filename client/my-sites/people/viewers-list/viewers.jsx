/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PeopleListItem from 'my-sites/people/people-list-item';
import { Card } from '@automattic/components';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import ViewersActions from 'lib/viewers/actions';
import ViewersStore from 'lib/viewers/store';
import InfiniteList from 'components/infinite-list';
import EmptyContent from 'components/empty-content';
import accept from 'lib/accept';
import ListEnd from 'components/list-end';
import { recordGoogleEvent } from 'state/analytics/actions';

class Viewers extends React.PureComponent {
	static displayName = 'Viewers';

	constructor() {
		super();

		this.infiniteList = React.createRef();
	}

	state = {
		bulkEditing: false,
	};

	renderPlaceholders = () => <PeopleListItem key="people-list-item-placeholder" />;

	fetchNextPage = () => {
		const paginationData = ViewersStore.getPaginationData( this.props.siteId );
		const currentPage = paginationData.currentViewersPage ? paginationData.currentViewersPage : 0;
		const page = currentPage + 1;

		this.props.recordGoogleEvent(
			'People',
			'Fetched more viewers with infinite list',
			'page',
			page
		);
		ViewersActions.fetch( this.props.siteId, page );
	};

	removeViewer = ( viewer ) => {
		this.props.recordGoogleEvent( 'People', 'Clicked Remove Viewer Button On Viewers List' );
		accept(
			<div>
				<p>
					{ this.props.translate(
						'If you remove this viewer, he or she will not be able to visit this site.'
					) }
				</p>
				<p>{ this.props.translate( 'Would you still like to remove this viewer?' ) }</p>
			</div>,
			( accepted ) => {
				if ( accepted ) {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Remove Button In Remove Viewer Confirmation'
					);
					ViewersActions.remove( this.props.site.ID, viewer );
				} else {
					this.props.recordGoogleEvent(
						'People',
						'Clicked Cancel Button In Remove Viewer Confirmation'
					);
				}
			},
			this.props.translate( 'Remove', { context: 'Confirm Remove viewer button text.' } )
		);
	};

	renderViewer = ( viewer ) => {
		const removeThisViewer = () => {
			this.removeViewer( viewer );
		};

		return (
			<PeopleListItem
				key={ viewer.ID }
				user={ viewer }
				type="viewer"
				site={ this.props.site }
				isSelectable={ this.state.bulkEditing }
				onRemove={ removeThisViewer }
			/>
		);
	};

	getViewerRef = ( viewer ) => 'viewer-' + viewer.ID;

	isLastPage = () => this.props.totalViewers <= this.props.viewers.length;

	render() {
		const listClass = this.state.bulkEditing ? 'bulk-editing' : null;
		let viewers;
		let emptyContentArgs = {
			title:
				this.props.site && this.props.site.jetpack
					? this.props.translate( "Oops, Jetpack sites don't support viewers." )
					: this.props.translate( "You don't have any viewers yet." ),
		};

		if ( ! this.props.viewers.length && ! this.props.fetching ) {
			if ( this.props.site && ! this.props.site.jetpack && ! this.props.site.is_private ) {
				emptyContentArgs = Object.assign( emptyContentArgs, {
					line: this.props.translate(
						'Only private sites can have viewers. You can make your site private by ' +
							'changing its visibility settings.'
					),
					action: this.props.translate( 'Visit Site Settings' ),
					actionURL: '/settings/general/' + this.props.site.slug,
				} );
			}

			return <EmptyContent { ...emptyContentArgs } />;
		}

		if ( this.props.viewers.length ) {
			viewers = (
				<InfiniteList
					key={ this.props.siteId }
					items={ this.props.viewers }
					className="viewers-list__infinite is-people"
					ref={ this.infiniteList }
					fetchingNextPage={ this.props.fetching }
					lastPage={ this.isLastPage() }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getViewerRef }
					renderLoadingPlaceholders={ this.renderPlaceholders }
					renderItem={ this.renderViewer }
					guessedItemHeight={ 126 }
				/>
			);
		} else {
			viewers = this.renderPlaceholders();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ this.props.label }
					site={ this.props.site }
					count={ this.props.fetching ? null : this.props.totalViewers }
				/>
				<Card className={ listClass }>{ viewers }</Card>
				{ this.isLastPage() && <ListEnd /> }
			</div>
		);
	}
}

export default connect( null, { recordGoogleEvent } )( localize( Viewers ) );

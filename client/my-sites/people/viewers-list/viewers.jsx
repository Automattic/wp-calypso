/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PeopleListItem from 'client/my-sites/people/people-list-item';
import Card from 'client/components/card';
import PeopleListSectionHeader from 'client/my-sites/people/people-list-section-header';
import ViewersActions from 'client/lib/viewers/actions';
import ViewersStore from 'client/lib/viewers/store';
import InfiniteList from 'client/components/infinite-list';
import EmptyContent from 'client/components/empty-content';
import analytics from 'client/lib/analytics';
import accept from 'client/lib/accept';
import ListEnd from 'client/components/list-end';

class Viewers extends React.PureComponent {
	static displayName = 'Viewers';

	state = {
		bulkEditing: false,
	};

	renderPlaceholders = () => {
		return <PeopleListItem key="people-list-item-placeholder" />;
	};

	fetchNextPage = () => {
		var paginationData = ViewersStore.getPaginationData( this.props.siteId ),
			currentPage = paginationData.currentViewersPage ? paginationData.currentViewersPage : 0,
			page = currentPage + 1;

		analytics.ga.recordEvent( 'People', 'Fetched more viewers with infinite list', 'page', page );
		ViewersActions.fetch( this.props.siteId, page );
	};

	removeViewer = viewer => {
		analytics.ga.recordEvent( 'People', 'Clicked Remove Viewer Button On Viewers List' );
		accept(
			<div>
				<p>
					{ this.props.translate(
						'If you remove this viewer, he or she will not be able to visit this site.'
					) }
				</p>
				<p>{ this.props.translate( 'Would you still like to remove this viewer?' ) }</p>
			</div>,
			accepted => {
				if ( accepted ) {
					analytics.ga.recordEvent(
						'People',
						'Clicked Remove Button In Remove Viewer Confirmation'
					);
					ViewersActions.remove( this.props.site.ID, viewer );
				} else {
					analytics.ga.recordEvent(
						'People',
						'Clicked Cancel Button In Remove Viewer Confirmation'
					);
				}
			},
			this.props.translate( 'Remove', { context: 'Confirm Remove viewer button text.' } )
		);
	};

	renderViewer = viewer => {
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

	getViewerRef = viewer => {
		return 'viewer-' + viewer.ID;
	};

	onClickSiteSettings = () => {
		analytics.ga.recordEvent( 'People', 'Clicked Site Settings Link On Empty Viewers' );
	};

	isLastPage = () => {
		return this.props.totalViewers <= this.props.viewers.length;
	};

	render() {
		var viewers,
			emptyContentArgs = {
				title:
					this.props.site && this.props.site.jetpack
						? this.props.translate( "Oops, Jetpack sites don't support viewers." )
						: this.props.translate( "You don't have any viewers yet." ),
			},
			listClass = this.state.bulkEditing ? 'bulk-editing' : null;

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
					className="people-selector__infinite-list"
					ref="infiniteList"
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

export default localize( Viewers );

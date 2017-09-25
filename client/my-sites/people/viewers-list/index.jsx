/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ViewersData from 'components/data/viewers-data';
import EmptyContent from 'components/empty-content';
import InfiniteList from 'components/infinite-list';
import ListEnd from 'components/list-end';
import accept from 'lib/accept';
import analytics from 'lib/analytics';
import ViewersActions from 'lib/viewers/actions';
import ViewersStore from 'lib/viewers/store';
import PeopleListItem from 'my-sites/people/people-list-item';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';

const Viewers = localize( React.createClass( {

	displayName: 'Viewers',

	getInitialState: function() {
		return {
			bulkEditing: false
		};
	},

	mixins: [ PureRenderMixin ],

	renderPlaceholders() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	},

	fetchNextPage() {
		let paginationData = ViewersStore.getPaginationData( this.props.siteId ),
			currentPage = paginationData.currentViewersPage ? paginationData.currentViewersPage : 0,
			page = currentPage + 1;

		analytics.ga.recordEvent( 'People', 'Fetched more viewers with infinite list', 'page', page );
		ViewersActions.fetch( this.props.siteId, page );
	},

	removeViewer: function( viewer ) {
		analytics.ga.recordEvent( 'People', 'Clicked Remove Viewer Button On Viewers List' );
		accept( (
			<div>
				<p>
				{
					this.props.translate(
						'If you remove this viewer, he or she will not be able to visit this site.'
					)
				}
				</p>
				<p>
					{ this.props.translate( 'Would you still like to remove this viewer?' ) }
				</p>
			</div>
			),
			accepted => {
				if ( accepted ) {
					analytics.ga.recordEvent( 'People', 'Clicked Remove Button In Remove Viewer Confirmation' );
					ViewersActions.remove( this.props.site.ID, viewer );
				} else {
					analytics.ga.recordEvent( 'People', 'Clicked Cancel Button In Remove Viewer Confirmation' );
				}
			},
			this.props.translate( 'Remove', { context: 'Confirm Remove viewer button text.' } )
		);
	},

	renderViewer( viewer ) {
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
	},

	getViewerRef( viewer ) {
		return 'viewer-' + viewer.ID;
	},

	onClickSiteSettings() {
		analytics.ga.recordEvent( 'People', 'Clicked Site Settings Link On Empty Viewers' );
	},

	isLastPage() {
		return this.props.totalViewers <= this.props.viewers.length;
	},

	render() {
		let viewers,
			emptyContentArgs = {
				title: this.props.site && this.props.site.jetpack
					? this.props.translate( "Oops, Jetpack sites don't support viewers." )
					: this.props.translate( "You don't have any viewers yet." )
			},
			listClass = ( this.state.bulkEditing ) ? 'bulk-editing' : null;

		if ( ! this.props.viewers.length && ! this.props.fetching ) {
			if ( this.props.site && ! this.props.site.jetpack && ! this.props.site.is_private ) {
				emptyContentArgs = Object.assign(
					emptyContentArgs,
					{
						line: this.props.translate(
							'Only private sites can have viewers. You can make your site private by ' +
							'changing its visibility settings.'
						),
						action: this.props.translate( 'Visit Site Settings' ),
						actionURL: '/settings/general/' + this.props.site.slug
					}
				);
			}

			return (
				<EmptyContent { ...emptyContentArgs } />
			);
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
					guessedItemHeight={ 126 }>
				</InfiniteList>
			);
		} else {
			viewers = this.renderPlaceholders();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ this.props.label }
					site={ this.props.site }
					count={ this.props.fetching ? null : this.props.totalViewers } />
				<Card className={ listClass }>
					{ viewers }
				</Card>
				{ this.isLastPage() && <ListEnd /> }
			</div>
		);
	}
} ) );

export default React.createClass( {
	displayName: 'ViewersList',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<ViewersData site={ this.props.site } siteId={ this.props.site.ID } label={ this.props.label }>
				<Viewers />
			</ViewersData>
		);
	}
} );

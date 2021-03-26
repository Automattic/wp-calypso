/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { Card } from '@automattic/components';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import InfiniteList from 'calypso/components/infinite-list';
import EmptyContent from 'calypso/components/empty-content';
import accept from 'calypso/lib/accept';
import ListEnd from 'calypso/components/list-end';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

class Viewers extends React.Component {
	infiniteList = React.createRef();

	renderPlaceholders = () => <PeopleListItem key="people-list-item-placeholder" />;

	fetchNextPage = () => {
		this.props.recordGoogleEvent(
			'People',
			'Fetched more viewers with infinite list',
			'page',
			this.props.page + 1
		);
		this.props.fetchNextPage();
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
					this.props.removeViewer( { siteId: this.props.site.ID, viewerId: viewer.ID } );
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
				onRemove={ removeThisViewer }
			/>
		);
	};

	getViewerRef = ( viewer ) => 'viewer-' + viewer.ID;

	render() {
		let viewers;
		let emptyContentArgs = {
			title:
				this.props.site && this.props.site.jetpack
					? this.props.translate( "Oops, Jetpack sites don't support viewers." )
					: this.props.translate( "You don't have any viewers yet." ),
		};

		if ( ! this.props.viewers.length && ! this.props.isFetching ) {
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
					key={ this.props.site.ID }
					items={ this.props.viewers }
					className="viewers-list__infinite is-people"
					ref={ this.infiniteList }
					fetchingNextPage={ this.props.isFetchingNextPage }
					lastPage={ ! this.props.hasNextPage }
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
					isPlaceholder={ this.props.isFetching }
					count={ this.props.isFetching ? null : this.props.totalViewers }
				/>
				<Card className="people-invites__invites-list">{ viewers }</Card>
				{ ! this.props.hasNextPage && <ListEnd /> }
			</div>
		);
	}
}

const mapDispatchToProps = {
	recordGoogleEvent,
};

export default connect( null, mapDispatchToProps )( localize( Viewers ) );

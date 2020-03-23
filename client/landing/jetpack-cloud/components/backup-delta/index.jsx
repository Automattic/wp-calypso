/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import ActivityCard from '../../components/activity-card';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import mediaImage from 'assets/images/illustrations/media.svg';

class BackupDelta extends Component {
	renderRealtime() {
		const { allowRestore, moment, translate } = this.props;

		const realtimeEvents = this.props.realtimeEvents.filter( event => event.activityIsRewindable );

		const cards = realtimeEvents.map( activity => (
			<ActivityCard
				{ ...{
					moment,
					activity,
					allowRestore,
				} }
			/>
		) );

		return (
			<div className="backup-delta__realtime">
				<div>{ translate( 'More backups from today' ) }</div>
				{ cards.length ? (
					cards
				) : (
					<div>{ translate( 'you have no more backups for this day' ) }</div>
				) }
			</div>
		);
	}

	renderMetaDiff() {
		const { metaDiff, translate } = this.props;
		const metas = [];

		if ( metaDiff.plugins > 0 ) {
			metas.push(
				translate( '+%(numPlugins)d Plugin', '+%(numPlugins)d Plugins', {
					count: metaDiff.plugins,
					args: {
						numPlugins: metaDiff.plugins,
					},
				} )
			);
		} else if ( metaDiff.plugins < 0 ) {
			metas.push(
				translate( '%(numPlugins)d Plugin', '%(numPlugins)d Plugins', {
					count: metaDiff.plugins,
					args: {
						numPlugins: metaDiff.plugins,
					},
				} )
			);
		}

		if ( metaDiff.themes > 0 ) {
			metas.push(
				translate( '+%(numThemes)d Theme', '+%(numThemes)d Themes', {
					count: metaDiff.themes,
					args: {
						numThemes: metaDiff.themes,
					},
				} )
			);
		} else if ( metaDiff.themes < 0 ) {
			metas.push(
				translate( '%(numThemes)d Theme', '%(numThemes)d Themes', {
					count: metaDiff.themes,
					args: {
						numThemes: metaDiff.themes,
					},
				} )
			);
		}

		if ( metaDiff.uploads > 0 ) {
			metas.push(
				translate( '+%(numUploads)d Upload', '+%(numUploads)d Uploads', {
					count: metaDiff.uploads,
					args: {
						numUploads: metaDiff.uploads,
					},
				} )
			);
		} else if ( metaDiff.uploads < 0 ) {
			metas.push(
				translate( '%(numUploads)d Upload', '%(numUploads)d Uploads', {
					count: metaDiff.uploads,
					args: {
						numUploads: metaDiff.uploads,
					},
				} )
			);
		}

		if ( metaDiff.posts > 0 ) {
			metas.push(
				translate( '+%(numPosts)d Post', '+%(numPosts)d Posts', {
					count: metaDiff.posts,
					args: {
						numPosts: metaDiff.posts,
					},
				} )
			);
		} else if ( metaDiff.posts < 0 ) {
			metas.push(
				translate( '%(numPosts)d Post', '%(numPosts)d Posts', {
					count: metaDiff.posts,
					args: {
						numPosts: metaDiff.posts,
					},
				} )
			);
		}

		return <div className="backup-delta__metas">{ metas.join( ', ' ) }</div>;
	}

	renderDaily() {
		const { backupAttempts, deltas, siteSlug, translate } = this.props;
		const mainBackup = backupAttempts.complete && backupAttempts.complete[ 0 ];

		const mediaCreated = deltas.mediaCreated.map( item => (
			<div key={ item.activityId } className="backup-delta__media-image">
				<img alt="" src={ item.activityMedia.thumbnail_url } />
				<div className="backup-delta__media-title">
					<Gridicon icon="add" />
					{ translate( 'Added' ) }
				</div>
			</div>
		) );

		const mediaCount = deltas.mediaCreated.length - deltas.mediaDeleted.length;
		const mediaOperator = mediaCount >= 0 ? '+' : '-';
		const mediaCountDisplay = `${ mediaOperator }${ mediaCount }`;

		const deletedElement = [
			<div className="backup-delta__media-image">
				<img alt="" src={ mediaImage } />
				<div className="backup-delta__deleted-count-bubble">-{ deltas.mediaDeleted.length }</div>
				<div className="backup-delta__media-title">
					<Gridicon icon="cross-circle" />
					{ translate( 'Removed' ) }
				</div>
			</div>,
		];

		const mediaItems =
			deltas.mediaDeleted.length > 0
				? mediaCreated.slice( 0, 2 ).concat( deletedElement )
				: mediaCreated.slice( 0, 3 );

		const postsCount = deltas.postsCreated.length - deltas.postsDeleted.length;
		const postsOperator = postsCount >= 0 ? '+' : '-';
		const postCountDisplay = `${ postsOperator }${ postsCount }`;

		const posts = deltas.posts.map( item => {
			if ( 'post__published' === item.activityName ) {
				return (
					<div key={ item.activityId } className="backup-delta__post-block">
						<Gridicon className="backup-delta__post-icon" icon="pencil" />
						<a className="backup-delta__post-link" href={ item.activityDescription[ 0 ].url }>
							{ item.activityDescription[ 0 ].children[ 0 ] }
						</a>
					</div>
				);
			}
			if ( 'post__trashed' === item.activityName ) {
				return (
					<div key={ item.activityId } className="backup-delta__post-block">
						<Gridicon className="backup-delta__post-icon" icon="cross" />
						<div className="backup-delta__post-link">
							{ item.activityDescription[ 0 ].children[ 0 ].text }
						</div>
					</div>
				);
			}
		} );

		return (
			<div className="backup-delta__daily">
				<div className="backup-delta__changes-header">
					{ translate( 'Changes in this backup' ) }
				</div>
				{ !! deltas.mediaCreated.length && (
					<Fragment>
						<div className="backup-delta__section-header">{ translate( 'Media' ) }</div>
						<div className="backup-delta__section-media">
							{ mediaItems }
							<div>
								<div className="backup-delta__count-bubble">{ mediaCountDisplay }</div>
							</div>
						</div>
					</Fragment>
				) }
				{ !! deltas.posts.length && (
					<Fragment>
						<div className="backup-delta__section-header">{ translate( 'Posts' ) }</div>
						<div className="backup-delta__section-posts">{ posts }</div>
						<div className="backup-delta__count-bubble">{ postCountDisplay }</div>
					</Fragment>
				) }
				{ this.renderMetaDiff() }
				{ mainBackup && (
					<Button
						isPrimary={ false }
						className="backup-delta__view-all-button"
						href={ `/backups/${ siteSlug }/detail/${ mainBackup.rewindId }` }
					>
						{ translate( 'View all backup details' ) }
					</Button>
				) }
			</div>
		);
	}

	render() {
		const { hasRealtimeBackups } = this.props;

		return (
			<div className="backup-delta">
				{ hasRealtimeBackups ? this.renderRealtime() : this.renderDaily() }
			</div>
		);
	}
}

export default localize( BackupDelta );

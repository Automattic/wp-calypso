/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
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
		const {
			allowRestore,
			timezone,
			gmtOffset,
			moment,
			realtimeBackups,
			siteSlug,
			translate,
		} = this.props;

		const cards = realtimeBackups.map( ( activity ) => (
			<ActivityCard
				key={ activity.activityId }
				{ ...{
					moment,
					activity,
					allowRestore,
					timezone,
					gmtOffset,
					siteSlug,
				} }
			/>
		) );

		return (
			<div className="backup-delta__realtime">
				<div className="backup-delta__realtime-header">
					{ translate( 'More backups from today' ) }
				</div>
				<div className="backup-delta__realtime-description">
					{ translate(
						'Your site is backed up in real time (as you make changes) as well as in one daily backup.'
					) }
				</div>
				{ cards.length ? (
					cards
				) : (
					<div className="backup-delta__realtime-emptyday">
						{ translate( 'There were no changes on this day. Your daily backup is above.' ) }
					</div>
				) }
			</div>
		);
	}

	renderMetaDiff() {
		const { metaDiff } = this.props;
		const metas = [];

		metaDiff.forEach( ( meta ) => {
			if ( meta.num > 0 || meta.num < 0 ) {
				const operator = meta.num < 0 ? '' : '+';
				const plural = meta.num > 1 || meta.num < -1 ? 's' : '';
				// TBD: How do we deal with translating these strings?
				metas.push( `${ operator }${ meta.num } ${ meta.type }${ plural }` );
			}
		} );

		return <div className="backup-delta__metas">{ metas.join( ', ' ) }</div>;
	}

	renderDaily() {
		const { deltas, metaDiff, translate } = this.props;

		const mediaCreated = deltas.mediaCreated.map( ( item ) => (
			<div key={ item.activityId } className="backup-delta__media-image">
				<img
					alt=""
					src={ item.activityMedia.available ? item.activityMedia.thumbnail_url : mediaImage }
				/>
				<div className="backup-delta__media-title">
					<Gridicon icon="plus" />
					<div className="backup-delta__media-title-text">{ translate( 'Added' ) }</div>
				</div>
			</div>
		) );

		const mediaCount = deltas.mediaCreated.length - deltas.mediaDeleted.length;
		const mediaOperator = mediaCount >= 0 ? '+' : '';
		const mediaCountDisplay = `${ mediaOperator }${ mediaCount }`;

		const deletedElement = [
			<div className="backup-delta__media-image">
				<img alt="" src={ mediaImage } />
				<div className="backup-delta__deleted-count-bubble">-{ deltas.mediaDeleted.length }</div>
				<div className="backup-delta__media-title">
					<Gridicon icon="cross-small" />
					<div className="backup-delta__media-title-text">{ translate( 'Removed' ) }</div>
				</div>
			</div>,
		];

		const mediaItems =
			deltas.mediaDeleted.length > 0
				? mediaCreated.slice( 0, 2 ).concat( deletedElement )
				: mediaCreated.slice( 0, 3 );

		const postsCount = deltas.postsCreated.length - deltas.postsDeleted.length;
		const postsOperator = postsCount >= 0 ? '+' : '';
		const postCountDisplay = `${ postsOperator }${ postsCount }`;

		const posts = deltas.posts.map( ( item ) => {
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

		const plugins = deltas.plugins.map( ( item ) => {
			const className =
				'plugin__installed' === item.activityName
					? 'backup-delta__extension-block-installed'
					: 'backup-delta__extension-block-removed';

			return (
				<div key={ item.activityId } className={ className }>
					{ item.activityDescription[ 0 ].children[ 0 ] }
				</div>
			);
		} );

		const themes = deltas.themes.map( ( item ) => {
			const className =
				'theme__installed' === item.activityName
					? 'backup-delta__extension-block-installed'
					: 'backup-delta__extension-block-removed';

			const icon =
				'theme__installed' === item.activityName ? (
					<Gridicon icon="plus" className="backup-delta__theme-icon-installed" />
				) : (
					<Gridicon icon="cross-small" className="backup-delta__theme-icon-removed" />
				);

			return (
				<div key={ item.activityId } className={ className }>
					{ icon }
					<div className="backup-delta__extension-block-text">
						{ item.activityDescription[ 0 ].children[ 0 ] }
					</div>
				</div>
			);
		} );

		const hasChanges = !! (
			deltas.mediaCreated.length ||
			deltas.posts.length ||
			deltas.plugins.length ||
			deltas.themes.length ||
			!! metaDiff.filter( ( diff ) => 0 !== diff.num ).length
		);

		return (
			<div className="backup-delta__daily">
				<div className="backup-delta__changes-header">
					{ translate( 'Changes in this backup' ) }
				</div>

				{ ! hasChanges && (
					<div className="backup-delta__daily-no-changes">
						{ translate(
							'Looks like there have been no new site changes since your last backup.'
						) }
					</div>
				) }

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
				{ !! deltas.plugins.length && (
					<Fragment>
						<div className="backup-delta__section-header">{ translate( 'Plugins' ) }</div>
						<div className="backup-delta__section-plugins">{ plugins }</div>
					</Fragment>
				) }
				{ !! deltas.themes.length && (
					<Fragment>
						<div className="backup-delta__section-header">{ translate( 'Themes' ) }</div>
						<div className="backup-delta__section-plugins">{ themes }</div>
					</Fragment>
				) }
				{ this.renderMetaDiff() }
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

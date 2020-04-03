/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { backupDetailPath } from 'landing/jetpack-cloud/sections/backups/paths';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { getCategorizedActivities } from 'landing/jetpack-cloud/sections/backups/utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import mediaImage from 'assets/images/illustrations/media.svg';

class BackupDelta extends Component {
	//todo: the metadiff approach is very fragile, we got an error in an edge case
	renderMetaDiff() {
		const { metaDiff } = this.props;
		const metas = [];

		metaDiff.forEach( meta => {
			if ( meta.num > 0 || meta.num < 0 ) {
				const operator = meta.num < 0 ? '' : '+';
				const plural = meta.num > 1 || meta.num < -1 ? 's' : '';
				// TBD: How do we deal with translating these strings?
				metas.push( `${ operator }${ meta.num } ${ meta.type }${ plural }` );
			}
		} );

		return <div className="backup-delta__metas">{ metas.join( ', ' ) }</div>;
	}

	renderMediaChanges( deltas ) {
		const { translate } = this.props;

		const mediaCount = deltas.mediaCreated.length - deltas.mediaDeleted.length;
		const mediaOperator = mediaCount >= 0 ? '+' : '';
		const mediaCountDisplay = `${ mediaOperator }${ mediaCount }`;

		const mediaCreated = deltas.mediaCreated.map( item => (
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

		return (
			<Fragment>
				<div className="backup-delta__section-header">{ translate( 'Media' ) }</div>
				<div className="backup-delta__section-media">
					{ mediaItems }
					<div>
						<div className="backup-delta__count-bubble">{ mediaCountDisplay }</div>
					</div>
				</div>
			</Fragment>
		);
	}

	renderPostsChanges( deltas ) {
		const { translate } = this.props;

		const postsCount = deltas.postsCreated.length - deltas.postsDeleted.length;
		const postsOperator = postsCount >= 0 ? '+' : '';
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
			<Fragment>
				<div className="backup-delta__section-header">{ translate( 'Posts' ) }</div>
				<div className="backup-delta__section-posts">{ posts }</div>
				<div className="backup-delta__count-bubble">{ postCountDisplay }</div>
			</Fragment>
		);
	}

	renderPluginsChanges( deltas ) {
		const { translate } = this.props;

		const plugins = deltas.plugins.map( item => {
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

		return (
			<Fragment>
				<div className="backup-delta__section-header">{ translate( 'Plugins' ) }</div>
				<div className="backup-delta__section-plugins">{ plugins }</div>
			</Fragment>
		);
	}

	renderThemesChanges( deltas ) {
		const { translate } = this.props;

		const themes = deltas.themes.map( item => {
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

		return (
			<Fragment>
				<div className="backup-delta__section-header">{ translate( 'Themes' ) }</div>
				<div className="backup-delta__section-plugins">{ themes }</div>
			</Fragment>
		);
	}

	renderChanges( deltas ) {
		return (
			<>
				{ !! deltas.mediaCreated.length && this.renderMediaChanges( deltas ) }
				{ !! deltas.posts.length && this.renderPostsChanges( deltas ) }
				{ !! deltas.plugins.length && this.renderPluginsChanges( deltas ) }
				{ !! deltas.themes.length && this.renderThemesChanges( deltas ) }

				{ /*todo: metaDiff is very fragile, we got errors in some cases.*/ }
				{ /*{ this.renderMetaDiff() }*/ }
			</>
		);
	}

	renderViewDetailsButton( backup ) {
		const { siteSlug, translate } = this.props;

		if ( ! backup || 'success' !== backup.activityStatus ) {
			return;
		}

		return (
			<Button
				isPrimary={ false }
				className="backup-delta__view-all-button"
				href={ backupDetailPath( siteSlug, backup.rewindId ) }
			>
				{ translate( 'View all backup details' ) }
			</Button>
		);
	}

	renderBackupDetails( backupsOnSelectedDate ) {
		const { translate } = this.props;

		const backup = backupsOnSelectedDate.lastBackup;

		if ( ! backup || 'success' !== backup.activityStatus ) {
			return;
		}
		const deltas = getCategorizedActivities( backupsOnSelectedDate.activities );

		return (
			<div className="backup-delta__daily">
				<div className="backup-delta__changes-header">
					{ translate( 'Changes in this backup' ) }
				</div>
				<div>
					{ deltas.totalChanges > 0
						? this.renderChanges( deltas )
						: translate(
								'Looks like there have been no new site changes since your last backup.'
						  ) }
				</div>
				<div>{ this.renderViewDetailsButton( backup ) }</div>
			</div>
		);
	}

	render() {
		const { backupsOnSelectedDate } = this.props;

		return (
			<div className="backup-delta">{ this.renderBackupDetails( backupsOnSelectedDate ) }</div>
		);
	}
}

export default localize( BackupDelta );

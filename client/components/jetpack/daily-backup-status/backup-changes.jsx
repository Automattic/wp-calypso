/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { useTranslate } from 'i18n-calypso';

/**
 * Image dependencies
 */
import mediaImage from 'calypso/assets/images/illustrations/media.svg';

// const renderMetaDiff = ( metaDiff ) => {
// 	const metas = [];
//
// 	metaDiff.forEach( ( meta ) => {
// 		if ( meta.num > 0 || meta.num < 0 ) {
// 			const operator = meta.num < 0 ? '' : '+';
// 			const plural = meta.num > 1 || meta.num < -1 ? 's' : '';
// 			// TBD: How do we deal with translating these strings?
// 			metas.push( `${ operator }${ meta.num } ${ meta.type }${ plural }` );
// 		}
// 	} );
//
// 	return <div className="daily-backup-status__metas">{ metas.join( ', ' ) }</div>;
// };

const BackupChanges = ( { deltas } ) => {
	const translate = useTranslate();

	const mediaCreated = deltas.mediaCreated.map( ( item ) => (
		<div key={ item.activityId } className="daily-backup-status__media-image">
			<img
				alt=""
				src={
					item.activityMedia && item.activityMedia.available
						? item.activityMedia.thumbnail_url
						: mediaImage
				}
			/>
			<div className="daily-backup-status__media-title">
				<Gridicon icon="plus" />
				<div className="daily-backup-status__media-title-text">{ translate( 'Added' ) }</div>
			</div>
		</div>
	) );

	const mediaCount = deltas.mediaCreated.length - deltas.mediaDeleted.length;
	const mediaOperator = mediaCount >= 0 ? '+' : '';
	const mediaCountDisplay = `${ mediaOperator }${ mediaCount }`;

	const deletedElement = [
		<div className="daily-backup-status__media-image" key="media-deleted">
			<img alt="" src={ mediaImage } />
			<div className="daily-backup-status__deleted-count-bubble">
				-{ deltas.mediaDeleted.length }
			</div>
			<div className="daily-backup-status__media-title">
				<Gridicon icon="cross-small" />
				<div className="daily-backup-status__media-title-text">{ translate( 'Removed' ) }</div>
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
				<div key={ item.activityId } className="daily-backup-status__post-block">
					<Gridicon className="daily-backup-status__post-icon" icon="pencil" />
					<a className="daily-backup-status__post-link" href={ item.activityDescription[ 0 ].url }>
						{ typeof item.activityDescription[ 0 ].children[ 0 ] === 'string'
							? item.activityDescription[ 0 ].children[ 0 ]
							: item.activityDescription[ 0 ].children[ 0 ].text }
					</a>
				</div>
			);
		}
		if ( 'post__trashed' === item.activityName ) {
			return (
				<div key={ item.activityId } className="daily-backup-status__post-block">
					<Gridicon className="daily-backup-status__post-icon" icon="cross" />
					<div className="daily-backup-status__post-link">
						{ item.activityDescription[ 0 ].children[ 0 ].text }
					</div>
				</div>
			);
		}
	} );

	const plugins = deltas.plugins.map( ( item ) => {
		const className =
			'plugin__installed' === item.activityName
				? 'daily-backup-status__extension-block-installed'
				: 'daily-backup-status__extension-block-removed';

		return (
			<div key={ item.activityId } className={ className }>
				{ item.activityDescription[ 0 ].children[ 0 ] }
			</div>
		);
	} );

	const themes = deltas.themes.map( ( item ) => {
		const className =
			'theme__installed' === item.activityName
				? 'daily-backup-status__extension-block-installed'
				: 'daily-backup-status__extension-block-removed';

		const icon =
			'theme__installed' === item.activityName ? (
				<Gridicon icon="plus" className="daily-backup-status__theme-icon-installed" />
			) : (
				<Gridicon icon="cross-small" className="daily-backup-status__theme-icon-removed" />
			);

		return (
			<div key={ item.activityId } className={ className }>
				{ icon }
				<div className="daily-backup-status__extension-block-text">
					{ item.activityDescription[ 0 ].children[ 0 ] }
				</div>
			</div>
		);
	} );

	const users = deltas.users.map( ( item ) => {
		return (
			<div key={ item.activityId } className="daily-backup-status__extension-block-installed">
				<Gridicon icon="plus" className="daily-backup-status__extension-block-installed" />
				<div className="daily-backup-status__extension-block-text">
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
		deltas.users.length
	);

	return (
		<div className="daily-backup-status__daily">
			<div className="daily-backup-status__changes-header">
				{ translate( 'Changes in this backup' ) }
			</div>

			{ ! hasChanges && (
				<div className="daily-backup-status__daily-no-changes">
					{ translate( 'Looks like there have been no new site changes since your last backup.' ) }
				</div>
			) }

			{ !! deltas.mediaCreated.length && (
				<>
					<div className="daily-backup-status__section-header">{ translate( 'Media' ) }</div>
					<div className="daily-backup-status__section-media">
						{ mediaItems }
						<div>
							<div className="daily-backup-status__count-bubble">{ mediaCountDisplay }</div>
						</div>
					</div>
				</>
			) }
			{ !! deltas.posts.length && (
				<>
					<div className="daily-backup-status__section-header">{ translate( 'Posts' ) }</div>
					<div className="daily-backup-status__section-posts">{ posts }</div>
					<div className="daily-backup-status__count-bubble">{ postCountDisplay }</div>
				</>
			) }
			{ !! deltas.plugins.length && (
				<>
					<div className="daily-backup-status__section-header">{ translate( 'Plugins' ) }</div>
					<div className="daily-backup-status__section-plugins">{ plugins }</div>
				</>
			) }
			{ !! deltas.themes.length && (
				<>
					<div className="daily-backup-status__section-header">{ translate( 'Themes' ) }</div>
					<div className="daily-backup-status__section-plugins">{ themes }</div>
				</>
			) }
			{ !! deltas.users.length && (
				<>
					<div className="daily-backup-status__section-header">{ translate( 'Users' ) }</div>
					<div className="daily-backup-status__section-plugins">{ users }</div>
				</>
			) }
		</div>
	);
};

export default BackupChanges;

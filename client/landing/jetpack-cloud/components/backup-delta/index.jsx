/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';

/**
 * Style dependencies
 */
import './style.scss';

class BackupDelta extends Component {
	render() {
		const { backupAttempts, deltas } = this.props;
		const mainBackup = backupAttempts.complete && backupAttempts.complete[ 0 ];
		const meta = mainBackup && mainBackup.activityDescription[ 2 ].children[ 0 ];

		const media = deltas.mediaCreated.map( item => (
			<div key={ item.activityId }>
				<img alt="" src={ item.activityMedia.thumbnail_url } />
				<div>{ item.activityMedia.name }</div>
			</div>
		) );

		const posts = deltas.posts.map( item => {
			if ( 'post__published' === item.activityName ) {
				return (
					<div key={ item.activityId }>
						<Gridicon icon="pencil" />
						{ item.activityDescription[ 0 ].children[ 0 ] }
					</div>
				);
			}
			if ( 'post__trashed' === item.activityName ) {
				return (
					<div key={ item.activityId }>
						<Gridicon icon="cross" />
						{ item.activityDescription[ 0 ].children[ 0 ].text }
					</div>
				);
			}
		} );

		return (
			<div>
				<div>Backup details</div>
				<div>Media</div>
				<div>{ deltas.mediaCreated && media }</div>
				<div>Posts</div>
				<div>{ deltas.posts && posts }</div>
				<div>{ meta }</div>
				<Button className="backup-delta__view-all-button">View all backup details</Button>
			</div>
		);
	}
}

export default BackupDelta;

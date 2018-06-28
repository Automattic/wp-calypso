/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defaults } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import FeatureExample from 'components/feature-example';

class ActivityLogDemo extends Component {
	render() {
		const demoContent = [
			{
				activityId: 1,
				activityDescription: [ 'My journey through Asia' ],
				activityIcon: 'posts',
				activityStatus: 'success',
				activityTitle: 'Post published',
				actorName: 'Maria',
			},
			{
				activityId: 2,
				activityDescription: [ 'Lovely summer photos' ],
				activityIcon: 'comment',
				activityStatus: 'warning',
				activityTitle: 'Comment waiting approval',
				actorName: 'Filippa',
			},
			{
				activityId: 3,
				activityDescription: [ 'My journey through Asia' ],
				activityIcon: 'posts',
				activityTitle: 'Post draft modified',
				actorName: 'Vincent',
			},
		];

		const demoItems = demoContent.map( content => {
			return defaults( content, {
				activityDate: new Date().toISOString(),
				activityMeta: {},
				activityStatus: null,
				activityTs: Date.now(),
				actorAvatarUrl: 'https://www.gravatar.com/avatar/0',
				actorRemoteId: 0,
				actorRole: 'administrator',
				actorType: 'Person',
			} );
		} );

		return (
			<FeatureExample>
				{ demoItems.map( log => (
					<ActivityLogItem
						key={ log.activityId }
						activity={ log }
						disableRestore={ true }
						disableBackup={ true }
						hideRestore={ true }
						siteId={ this.props.siteId }
					/>
				) ) }
			</FeatureExample>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteId: siteId,
} ) )( localize( ActivityLogDemo ) );

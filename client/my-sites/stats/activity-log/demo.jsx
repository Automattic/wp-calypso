/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import FeatureExample from 'components/feature-example';

class ActivityLogDemo extends Component {
	render() {
		const { translate, siteId } = this.props;

		const demoContents = [
			{
				activityTs: new Date( '2018-06-29T18:38:00.000Z' ).getTime(),
				activityDescription: [ translate( 'My journey through Asia' ) ],
				activityIcon: 'posts',
				activityStatus: 'success',
				activityTitle: translate( 'Post published' ),
				actorName: 'Maria',
				actorRole: 'administrator',
			},
			{
				activityTs: new Date( '2018-06-28T00:20:00.000Z' ).getTime(),
				activityDescription: [ translate( 'Lovely summer photos' ) ],
				activityIcon: 'comment',
				activityStatus: 'warning',
				activityTitle: translate( 'Comment waiting approval' ),
				actorName: 'Filippa',
			},
			{
				activityTs: new Date( '2018-06-27T15:10:00.000Z' ).getTime(),
				activityDescription: [ translate( 'My journey through Asia' ) ],
				activityIcon: 'posts',
				activityTitle: translate( 'Post draft modified' ),
				actorName: 'Vincent',
				actorRole: 'administrator',
			},
		];

		const demoItems = demoContents.map( content => {
			return Object.assign(
				{
					activityMeta: {},
					activityStatus: null,
					actorRole: '',
					actorType: 'Person',
				},
				content
			);
		} );

		return (
			<div className="activity-log__demo">
				<FeatureExample>
					{ demoItems.map( log => (
						<ActivityLogItem
							key={ `activity-log-demo-${ log.activityTs }` }
							activity={ log }
							disableRestore={ true }
							disableBackup={ true }
							hideRestore={ true }
							siteId={ siteId }
						/>
					) ) }
				</FeatureExample>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteId: siteId,
} ) )( localize( ActivityLogDemo ) );

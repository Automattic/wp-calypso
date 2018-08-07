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
import FormattedHeader from 'components/formatted-header';
import UpgradeBanner from '../activity-log-banner/upgrade-banner';

class ActivityLogExample extends Component {
	render() {
		const { translate, siteId, siteIsOnFreePlan } = this.props;

		const exampleContents = [
			{
				activityTs: new Date( '2018-06-28T18:38:00.000Z' ).getTime(),
				activityDescription: [ translate( 'My journey through Asia' ) ],
				activityIcon: 'posts',
				activityStatus: 'success',
				activityTitle: translate( 'Post published' ),
				actorName: 'Maria',
				actorRole: 'administrator',
			},
			{
				activityTs: new Date( '2018-06-28T15:10:00.000Z' ).getTime(),
				activityDescription: [ translate( 'Lovely summer photos' ) ],
				activityIcon: 'comment',
				activityStatus: 'warning',
				activityTitle: translate( 'Comment waiting approval' ),
				actorName: 'Filippa',
			},
			{
				activityTs: new Date( '2018-06-28T00:20:00.000Z' ).getTime(),
				activityDescription: [ translate( 'My journey through Asia' ) ],
				activityIcon: 'posts',
				activityTitle: translate( 'Post draft modified' ),
				actorName: 'Vincent',
				actorRole: 'administrator',
			},
		];

		const exampleItems = exampleContents.map( example => {
			return Object.assign(
				{
					activityMeta: {},
					activityStatus: null,
					actorRole: '',
					actorType: 'Person',
				},
				example
			);
		} );

		return (
			<div className="activity-log-example">
				<FormattedHeader
					headerText={ translate( 'This is your activity log' ) }
					subHeaderText={ translate( 'Events happening at your site will appear here.' ) }
				/>
				<FeatureExample role="presentation">
					{ exampleItems.map( log => (
						<ActivityLogItem
							key={ `activity-log-example-${ log.activityTs }` }
							activity={ log }
							disableRestore={ true }
							disableBackup={ true }
							hideRestore={ true }
							siteId={ siteId }
						/>
					) ) }
				</FeatureExample>
				{ siteIsOnFreePlan && <UpgradeBanner siteId={ siteId } /> }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteId: siteId,
} ) )( localize( ActivityLogExample ) );

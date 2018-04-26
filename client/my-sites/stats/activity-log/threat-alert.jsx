/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import FoldableCard from 'components/foldable-card';
import DetectionTime from './detection-time';

export class ThreatAlert extends Component {
	render() {
		const { threat, translate } = this.props;
		const earliestDetection =
			threat.files &&
			threat.files.reduce(
				( earliest, { firstDetected } ) => ( firstDetected < earliest ? firstDetected : earliest ),
				Infinity
			);

		return (
			<FoldableCard
				className="activity-log__threat-alert"
				clickableHeader
				compact
				header={
					<Fragment>
						<ActivityIcon activityIcon="notice-outline" activityStatus="error" />
						<div className="activity-log__threat-alert-header">
							<div>
								<span className="activity-log__threat-alert-title">
									{ translate( 'Thread found' ) }
								</span>
								{ threat.files && <DetectionTime date={ earliestDetection } /> }
							</div>
							<span>{ translate( 'Malware code detected' ) }</span>
						</div>
					</Fragment>
				}
			>
				{ threat.description }
				{ threat.files &&
					threat.files.map( file => (
						<Fragment key={ file.name }>
							<div className="activity-log__threat-alert-file-header">
								<span className="activity-log__threat-alert-filename">{ file.name }</span>
								<DetectionTime date={ file.firstDetected } />
							</div>
							<p className="activity-log__threat-alert-dirpath">{ file.dirpath }</p>
							{ file.diff && (
								<Fragment>
									<pre>
										<code>{ file.diff[ 0 ] }</code>
									</pre>
									<pre>
										<code>{ file.diff[ 1 ] }</code>
									</pre>
								</Fragment>
							) }
						</Fragment>
					) ) }
			</FoldableCard>
		);
	}
}

export default localize( ThreatAlert );

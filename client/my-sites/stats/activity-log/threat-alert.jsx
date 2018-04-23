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

export class ThreatAlert extends Component {
	state = {
		isExpanded: false,
	};

	render() {
		const { moment, threat, translate } = this.props;

		return (
			<FoldableCard
				clickableHeader
				compact
				header={
					<Fragment>
						<ActivityIcon activityIcon="notice" activityStatus="error" />
						<span>{ translate( 'Malware code detected' ) }</span>
					</Fragment>
				}
			>
				{ threat.description }
				{ threat.files &&
					threat.files.map( file => (
						<Fragment key={ file.name }>
							<p>{ file.name }</p>
							<p>{ file.dirpath }</p>
							<p>
								{ moment
									.duration( moment( file.firstDetected ).diff( moment() ) )
									.humanize( true ) }
							</p>
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

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
import DiffViewer from 'components/diff-viewer';
import FoldableCard from 'components/foldable-card';
import MarkedLines from 'components/marked-lines';
import TimeSince from 'components/time-since';

export class ThreatAlert extends Component {
	render() {
		const { threat, translate } = this.props;

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
									{ threat.diff && translate( 'Threat found in core WordPress file' ) }
									{ threat.extension &&
										threat.extension.type === 'plugin' &&
										translate( 'Threat found in your {{s}}%(slug)s{{/s}} Plugin', {
											args: {
												slug: threat.extension.slug,
											},
											components: {
												s: <span className="activity-log__threat-alert-title-slug" />,
											},
										} ) }
									{ threat.extension &&
										threat.extension.type === 'theme' &&
										translate( 'Threat found in your {{s}}%(slug)s{{/s}} Theme', {
											args: {
												slug: threat.extension.slug,
											},
											components: {
												s: <span className="activity-log__threat-alert-title-slug" />,
											},
										} ) }
									{ ! threat.extension && ! threat.diff && translate( 'Threat found' ) }
								</span>
								<TimeSince
									className="activity-log__threat-alert-time-since"
									date={ threat.firstDetected }
									dateFormat="ll"
								/>
							</div>
							<span>{ translate( 'Malware code detected' ) }</span>
						</div>
					</Fragment>
				}
			>
				{ ! threat.filename && (
					<p className="activity-log__threat-alert-signature">{ threat.signature }</p>
				) }
				{ threat.filename && (
					<Fragment>
						<p>
							{ translate( '{{s}}%(signature)s{{/s}} in:', {
								args: { signature: threat.signature },
								comment: 'filename follows in separate line; e.g. "PHP.Injection.5 in: `post.php`"',
								components: { s: <span className="activity-log__threat-alert-signature" /> },
							} ) }
						</p>
						<pre className="activity-log__threat-alert-filename">{ threat.filename }</pre>
					</Fragment>
				) }
				<p className="activity-log__threat-alert-description">{ threat.description }</p>
				{ threat.context && <MarkedLines context={ threat.context } /> }
				{ threat.diff && <DiffViewer diff={ threat.diff } /> }
			</FoldableCard>
		);
	}
}

export default localize( ThreatAlert );

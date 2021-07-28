/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { withApplySiteOffset } from 'calypso/components/site-offset';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import ActivityActor from 'calypso/components/activity-card/activity-actor';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import getAllowRestore from 'calypso/state/selectors/get-allow-restore';
import Gridicon from 'calypso/components/gridicon';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import MediaPreview from './media-preview';
import ShareActivity from './share-activity';
import StreamsContent from './streams-content';
import Toolbar from './toolbar';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCard extends Component {
	static propTypes = {
		activity: PropTypes.object.isRequired,
		allowRestore: PropTypes.bool.isRequired,
		applySiteOffset: PropTypes.func,
		className: PropTypes.string,
		shareable: PropTypes.bool,
		moment: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		summarize: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		summarize: false,
		shareable: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			showContent: false,
		};
	}

	render() {
		const {
			activity,
			allowRestore,
			applySiteOffset,
			className,
			moment,
			shareable,
			siteId,
			summarize,
		} = this.props;

		const backupTimeDisplay = applySiteOffset
			? applySiteOffset( activity.activityTs ).format( 'LT' )
			: moment( activity.activityTs ).format( 'LT' );
		const showStreamsContent = this.state.showContent && activity.streams;
		const hasActivityFailed = activity.activityStatus === 'error';

		const onToggleContent = () => {
			this.setState( { showContent: ! this.state.showContent } );
		};

		return (
			<div
				className={ classnames( className, 'activity-card', {
					'with-error': hasActivityFailed,
				} ) }
			>
				<QueryRewindState siteId={ siteId } />
				{ ! summarize && (
					<div className="activity-card__header">
						<div className="activity-card__time">
							<Gridicon icon={ activity.activityIcon } className="activity-card__time-icon" />
							<div className="activity-card__time-text">{ backupTimeDisplay }</div>
						</div>
						{ isEnabled( 'jetpack/activity-log-sharing' ) && shareable && (
							<ShareActivity siteId={ siteId } activity={ activity } />
						) }
					</div>
				) }
				<Card>
					<ActivityActor
						actorAvatarUrl={ activity.actorAvatarUrl }
						actorName={ activity.actorName }
						actorRole={ activity.actorRole }
						actorType={ activity.actorType }
					/>
					<div className="activity-card__activity-description">
						<MediaPreview activity={ activity } />
						<ActivityDescription activity={ activity } rewindIsActive={ allowRestore } />
					</div>
					<div className="activity-card__activity-title">{ activity.activityTitle }</div>

					{ ! summarize && (
						<Toolbar
							siteId={ siteId }
							activity={ activity }
							isContentExpanded={ this.state.showContent }
							onToggleContent={ onToggleContent }
						/>
					) }

					{ showStreamsContent && (
						<div className="activity-card__content">
							<StreamsContent streams={ activity.streams } />
							<Toolbar
								siteId={ siteId }
								activity={ activity }
								isContentExpanded={ this.state.showContent }
								onToggleContent={ onToggleContent }
							/>
						</div>
					) }
				</Card>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	return {
		allowRestore: getAllowRestore( state, siteId ),
		siteId,
		siteSlug,
	};
};

export default connect( mapStateToProps )(
	withLocalizedMoment( withApplySiteOffset( localize( ActivityCard ) ) )
);

/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityActor from './activity-actor';
import ActivityIcon from './activity-icon';
import SplitButton from 'components/split-button';
import FoldableCard from 'components/foldable-card';
import FormattedBlock from 'components/notes-formatted-block';
import PopoverMenuItem from 'components/popover/menu-item';
import { getActivityLog, getSiteGmtOffset, getSiteTimezoneValue } from 'state/selectors';

import { adjustMoment } from '../activity-log/utils';

class ActivityLogItem extends Component {
	handleClickRestore = () => this.props.requestDialog( this.props.activityId, 'item', 'restore' );

	handleClickBackup = () => this.props.requestDialog( this.props.activityId, 'item', 'backup' );

	renderHeader() {
		const {
			activityDescription,
			activityTitle,
			actorActivityUrl,
			actorName,
			actorRole,
			actorType,
		} = this.props.activity;

		return (
			<div className="activity-log-item__card-header">
				<ActivityActor { ...{ actorActivityUrl, actorName, actorRole, actorType } } />
				<div className="activity-log-item__description">
					<div className="activity-log-item__description-content">
						<FormattedBlock content={ activityDescription[ 0 ] } />
					</div>
					<div className="activity-log-item__description-summary">{ activityTitle }</div>
				</div>
			</div>
		);
	}

	renderItemAction() {
		const {
			disableRestore,
			disableBackup,
			hideRestore,
			translate,
			activity: { activityIsRewindable },
		} = this.props;

		if ( hideRestore || ! activityIsRewindable ) {
			return null;
		}

		return (
			<div className="activity-log-item__action">
				<SplitButton
					icon="history"
					label={ translate( 'Rewind' ) }
					onClick={ this.handleClickRestore }
					disableMain={ disableRestore }
					disabled={ disableRestore && disableBackup }
					compact
					primary={ ! disableRestore }
				>
					<PopoverMenuItem
						disabled={ disableBackup }
						icon="cloud-download"
						onClick={ this.handleClickBackup }
					>
						{ translate( 'Download backup' ) }
					</PopoverMenuItem>
				</SplitButton>
			</div>
		);
	}

	render() {
		const { activity, className, gmtOffset, isDiscarded, moment, timezone } = this.props;
		const { activityIcon, activityStatus, activityTs } = activity;

		const classes = classNames( 'activity-log-item', className, {
			'is-discarded': isDiscarded,
		} );

		return (
			<div className={ classes }>
				<div className="activity-log-item__type">
					<div className="activity-log-item__time">
						{ adjustMoment( {
							gmtOffset,
							moment: moment.utc( activityTs ),
							timezone,
						} ).format( 'LT' ) }
					</div>
					<ActivityIcon activityIcon={ activityIcon } activityStatus={ activityStatus } />
				</div>
				<FoldableCard
					className="activity-log-item__card"
					expandedSummary={ this.renderItemAction() }
					header={ this.renderHeader() }
					summary={ this.renderItemAction() }
				/>
			</div>
		);
	}
}

const mapStateToProps = ( state, { activityId, siteId } ) => {
	const activity = getActivityLog( state, siteId, activityId );
	const gmtOffset = getSiteGmtOffset( state, siteId );
	const timezone = getSiteTimezoneValue( state, siteId );

	return {
		activity,
		gmtOffset,
		timezone,
	};
};

export default connect( mapStateToProps )( localize( ActivityLogItem ) );

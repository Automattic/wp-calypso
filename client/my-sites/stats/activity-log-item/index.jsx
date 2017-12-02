/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityActor from './activity-actor';
import ActivityIcon from './activity-icon';
import EllipsisMenu from 'components/ellipsis-menu';
import FoldableCard from 'components/foldable-card';
import FormattedBlock from 'components/notes-formatted-block';
import PopoverMenuItem from 'components/popover/menu-item';

const stopPropagation = event => event.stopPropagation();

class ActivityLogItem extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		disableBackup: PropTypes.bool.isRequired,
		hideRestore: PropTypes.bool,
		requestDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		log: PropTypes.shape( {
			// Base
			activityDate: PropTypes.string.isRequired,
			activityGroup: PropTypes.string.isRequired,
			activityIcon: PropTypes.string.isRequired,
			activityId: PropTypes.string.isRequired,
			activityName: PropTypes.string.isRequired,
			activityStatus: PropTypes.string,
			activityTitle: PropTypes.string.isRequired,
			activityTs: PropTypes.number.isRequired,

			// Actor
			actorAvatarUrl: PropTypes.string.isRequired,
			actorName: PropTypes.string.isRequired,
			actorRemoteId: PropTypes.number.isRequired,
			actorRole: PropTypes.string.isRequired,
			actorType: PropTypes.string.isRequired,
			actorWpcomId: PropTypes.number.isRequired,
		} ).isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disableRestore: false,
		disableBackup: false,
	};

	handleClickRestore = () =>
		this.props.requestDialog( this.props.log.activityId, 'item', 'restore' );

	handleClickBackup = () => this.props.requestDialog( this.props.log.activityId, 'item', 'backup' );

	renderHeader() {
		const { log } = this.props;
		const { activityDescription, activityTitle } = log;

		return (
			<div className="activity-log-item__card-header">
				<ActivityActor
					{ ...pick( log, [ 'actorAvatarUrl', 'actorName', 'actorRole', 'actorType' ] ) }
				/>
				{ ! activityDescription && (
					<div className="activity-log-item__title">{ activityTitle }</div>
				) }
				{ activityDescription && (
					<div className="activity-log-item__description">
						{ activityDescription.map( ( part, key ) => (
							<FormattedBlock key={ key } content={ part } />
						) ) }
					</div>
				) }
			</div>
		);
	}

	renderItemAction() {
		const {
			disableRestore,
			disableBackup,
			hideRestore,
			translate,
			log: { activityIsRewindable },
		} = this.props;

		if ( hideRestore || ! activityIsRewindable ) {
			return null;
		}

		return (
			<div className="activity-log-item__action">
				<EllipsisMenu onClick={ stopPropagation } position="bottom right">
					<PopoverMenuItem
						disabled={ disableRestore }
						icon="history"
						onClick={ this.handleClickRestore }
					>
						{ translate( 'Rewind to this point' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						disabled={ disableBackup }
						icon="cloud-download"
						onClick={ this.handleClickBackup }
					>
						{ translate( 'Download backup' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
		);
	}

	render() {
		const { applySiteOffset, className, log, moment } = this.props;
		const { activityIcon, activityIsDiscarded, activityStatus } = log;

		const classes = classNames( 'activity-log-item', className, {
			'is-discarded': activityIsDiscarded,
		} );

		return (
			<div className={ classes }>
				<div className="activity-log-item__type">
					<div className="activity-log-item__time">
						{ applySiteOffset( moment.utc( log.activityTs ) ).format( 'LT' ) }
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

export default connect()( localize( ActivityLogItem ) );

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';
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
import PopoverMenuItem from 'components/popover/menu-item';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { ACTIVITY_WHITELIST } from 'state/data-layer/wpcom/sites/activity/from-api';

const debug = debugFactory( 'calypso:activity-log:item' );

const stopPropagation = event => event.stopPropagation();

class ActivityLogItem extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		hideRestore: PropTypes.bool,
		requestRestore: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		log: PropTypes.shape( {
			// Base
			activityDate: PropTypes.string.isRequired,
			activityGroup: PropTypes.oneOf( [
				'attachment',
				'comment',
				'core',
				'menu',
				'plugin',
				'post',
				'rewind',
				'term',
				'theme',
				'user',
				'widget',
			] ).isRequired,
			activityIcon: PropTypes.string.isRequired,
			activityId: PropTypes.string.isRequired,
			activityName: PropTypes.oneOf( ACTIVITY_WHITELIST ).isRequired,
			activityTitle: PropTypes.string.isRequired,
			activityTs: PropTypes.number.isRequired,

			// Actor
			actorAvatarUrl: PropTypes.string.isRequired,
			actorName: PropTypes.string.isRequired,
			actorRemoteId: PropTypes.number.isRequired,
			actorRole: PropTypes.string.isRequired,
			actorWpcomId: PropTypes.number.isRequired,
		} ).isRequired,

		// connect
		recordTracksEvent: PropTypes.func.isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disableRestore: false,
	};

	handleClickRestore = () => {
		const {
			log,
			requestRestore,
		} = this.props;
		requestRestore( log.activityTs, 'item' );
	};

	handleOpen = () => {
		const {
			log,
			recordTracksEvent,
		} = this.props;
		const {
			group,
			name,
			activityTs,
		} = log;

		debug( 'opened log', log );

		recordTracksEvent( 'calypso_activitylog_item_expand', {
			group,
			name,
			timestamp: activityTs,
		} );
	};

	// FIXME: Just for demonstration purposes
	renderDescription() {
		const {
			log,
			moment,
			translate,
			applySiteOffset,
		} = this.props;
		const {
			name,
			activityTs,
		} = log;

		return (
			<div>
				<div>
					{ translate( 'An event "%(eventName)s" occurred at %(date)s', {
						args: {
							date: applySiteOffset( moment.utc( activityTs ) ).format( 'LLL' ),
							eventName: name,
						}
					} ) }
				</div>
				<div className="activity-log-item__id">ID { activityTs }</div>
			</div>
		);
	}

	renderHeader() {
		const { log } = this.props;

		return (
			<div className="activity-log-item__card-header">
				<ActivityActor { ...pick( log, [ 'actorAvatarUrl', 'actorName', 'actorRole' ] ) } />
				<div className="activity-log-item__title">
					{ log.activityTitle }
				</div>
			</div>
		);
	}

	renderSummary() {
		const {
			disableRestore,
			hideRestore,
			translate,
		} = this.props;

		if ( hideRestore ) {
			return null;
		}

		return (
			<div className="activity-log-item__action">
				<EllipsisMenu
					onClick={ stopPropagation }
					position="bottom right"
				>
					<PopoverMenuItem
						disabled={ disableRestore }
						icon="history"
						onClick={ this.handleClickRestore }
					>
						{ translate( 'Rewind to this point' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
		);
	}

	renderTime() {
		const {
			moment,
			log,
			applySiteOffset,
		} = this.props;

		return (
			<div className="activity-log-item__time">
				{ applySiteOffset( moment.utc( log.activityTs ) ).format( 'LT' ) }
			</div>
		);
	}

	render() {
		const {
			className,
			log,
		} = this.props;
		const {
			group,
			name,
			object,
		} = log;

		const classes = classNames( 'activity-log-item', className );

		return (
			<div className={ classes } >
				<div className="activity-log-item__type">
					{ this.renderTime() }
					<ActivityIcon group={ group } name={ name } object={ object } />
				</div>
				<FoldableCard
					className="activity-log-item__card"
					clickableHeader
					expandedSummary={ this.renderSummary() }
					header={ this.renderHeader() }
					onOpen={ this.handleOpen }
					summary={ this.renderSummary() }
				>
					{ this.renderDescription() }
				</FoldableCard>
			</div>
		);
	}
}

export default connect( null, {
	recordTracksEvent: recordTracksEventAction,
} )( localize( ActivityLogItem ) );

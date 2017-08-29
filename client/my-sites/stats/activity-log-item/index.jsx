/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
			activityName: PropTypes.oneOf( [
				'attachment__deleted',
				'attachment__updated',
				'attachment__uploaded',
				'comment__approved',
				'comment__content_modified',
				'comment__deleted',
				'comment__published',
				'comment__published_awaiting_approval',
				'comment__spammed',
				'comment__trashed',
				'comment__unapproved',
				'core__autoupdated',
				'core__network_updated',
				'core__reinstalled',
				'core__update_available',
				'core__updated',
				'feedback__published',
				'jetpack__site_connected',
				'jetpack__site_disconnected',
				'jetpack__user_linked',
				'jetpack__user_unlinked',
				'menu__added',
				'menu__deleted',
				'menu__updated',
				'menu__updated',
				'menu__updated',
				'plugin__activated',
				'plugin__autoupdated',
				'plugin__deactivated',
				'plugin__deleted',
				'plugin__deletion_failed',
				'plugin__edited',
				'plugin__installed',
				'plugin__installed_filesystem',
				'plugin__network_activated',
				'plugin__network_deactivated',
				'plugin__update_available',
				'plugin__updated',
				'post__deleted',
				'post__exported',
				'post__imported',
				'post__publicized',
				'post__published',
				'post__trashed',
				'post__updated',
				'rewind__complete',
				'rewind__error',
				'term__created',
				'term__deleted',
				'term__edited',
				'theme__deleted',
				'theme__edited',
				'theme__installed',
				'theme__network_disabled',
				'theme__network_enabled',
				'theme__switched',
				'theme__update_available',
				'theme__updated',
				'user__added',
				'user__deleted',
				'user__deleted-reassigned',
				'user__failed_login_attempt',
				'user__login',
				'user__logout',
				'user__registered',
				'user__removed',
				'user__updated',
				'widget__added',
				'widget__edited',
				'widget__inactive',
				'widget__inactive-cleared',
				'widget__removed',
				'widget__reordered',
			] ).isRequired,
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
			activityGroup,
			activityName,
			activityTs,
		} = log;

		debug( 'opened log', log );

		recordTracksEvent( 'calypso_activitylog_item_expand', {
			group: activityGroup,
			name: activityName,
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
			activityName,
			activityTs,
		} = log;

		return (
			<div>
				<div>
					{ translate( 'An event "%(eventName)s" occurred at %(date)s', {
						args: {
							date: applySiteOffset( moment.utc( activityTs ) ).format( 'LLL' ),
							eventName: activityName,
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

		const classes = classNames( 'activity-log-item', className );

		return (
			<div className={ classes } >
				<div className="activity-log-item__type">
					{ this.renderTime() }
					<ActivityIcon { ...pick( log, [ 'activityName', 'activityIcon' ] ) } />
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

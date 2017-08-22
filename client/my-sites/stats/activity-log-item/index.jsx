/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityActor from './activity-actor';
import ActivityIcon from './activity-icon';
import ActivityTitle from './activity-title';
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
			group: PropTypes.oneOf( [
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
			name: PropTypes.string.isRequired,
			ts_utc: PropTypes.number.isRequired,

			actor: PropTypes.shape( {
				display_name: PropTypes.string,
				login: PropTypes.string,
				translated_role: PropTypes.string,
				user_email: PropTypes.string,
				user_roles: PropTypes.string,
				wpcom_user_id: PropTypes.number,
				avatar_url: PropTypes.string,
			} ),

			object: PropTypes.shape( {
				attachment: PropTypes.shape( {
					mime_type: PropTypes.string,
					id: PropTypes.number.isRequired,
					title: PropTypes.string.isRequired,
					url: PropTypes.shape( {
						host: PropTypes.string.isRequired,
						url: PropTypes.string.isRequired,
						host_reversed: PropTypes.string.isRequired,
					} ).isRequired,
				} ),

				comment: PropTypes.shape( {
					approved: PropTypes.bool.isRequired,
					id: PropTypes.number.isRequired,
				} ),

				core: PropTypes.shape( {
					new_version: PropTypes.string,
					old_version: PropTypes.string,
				} ),

				error: PropTypes.shape( {
					error_code: PropTypes.string,
					error_message: PropTypes.string,
				} ),

				menu: PropTypes.shape( {
					id: PropTypes.number,
					name: PropTypes.string,
				} ),

				plugin: PropTypes.oneOfType( [
					PropTypes.shape( {
						name: PropTypes.string,
						previous_version: PropTypes.string,
						slug: PropTypes.string,
						version: PropTypes.string,
					} ),
					PropTypes.arrayOf(
						PropTypes.shape( {
							name: PropTypes.string,
							previous_version: PropTypes.string,
							slug: PropTypes.string,
							version: PropTypes.string,
						} ),
					),
				] ),

				post: PropTypes.shape( {
					id: PropTypes.number.isRequired,
					status: PropTypes.string.isRequired,
					type: PropTypes.string,
					title: PropTypes.string,
				} ),

				term: PropTypes.shape( {
					id: PropTypes.number.isRequired,
					title: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
				} ),

				theme: PropTypes.oneOfType( [
					PropTypes.arrayOf(
						PropTypes.shape( {
							name: PropTypes.string,
							slug: PropTypes.string,
							uri: PropTypes.string,
							version: PropTypes.string,
						} )
					),
					PropTypes.shape( {
						name: PropTypes.string,
						slug: PropTypes.string,
						uri: PropTypes.string,
						version: PropTypes.string,
					} ),
				] ),

				user: PropTypes.shape( {
					display_name: PropTypes.string,
					external_user_id: PropTypes.string,
					login: PropTypes.string,
					wpcom_user_id: PropTypes.number,
				} ),

				widget: PropTypes.shape( {
					id: PropTypes.number,
					name: PropTypes.string,
					sidebar: PropTypes.string,
				} ),
			} ),
		} ).isRequired,

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
		requestRestore( log.ts_utc, 'item' );
	};

	handleOpen = () => {
		const {
			log,
			recordTracksEvent,
		} = this.props;
		const {
			group,
			name,
			ts_utc,
		} = log;

		debug( 'opened log', log );

		recordTracksEvent( 'calypso_activitylog_item_expand', {
			group,
			name,
			timestamp: ts_utc,
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
			ts_utc,
		} = log;

		return (
			<div>
				<div>
					{ translate( 'An event "%(eventName)s" occurred at %(date)s', {
						args: {
							date: applySiteOffset( moment.utc( ts_utc ) ).format( 'LLL' ),
							eventName: name,
						}
					} ) }
				</div>
				<div className="activity-log-item__id">ID { ts_utc }</div>
			</div>
		);
	}

	renderHeader() {
		const {
			action,
			name,
		} = this.props.log;
		const actor = get( this.props, [ 'log', 'actor' ] );
		const object = get( this.props, [ 'log', 'object' ] );

		return (
			<div className="activity-log-item__card-header">
				<ActivityActor actor={ actor } />
				<ActivityTitle
					action={ action }
					actor={ actor }
					name={ name }
					object={ object }
				/>
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
				{ applySiteOffset( moment.utc( log.ts_utc ) ).format( 'LT' ) }
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

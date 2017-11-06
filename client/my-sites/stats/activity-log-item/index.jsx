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

	//
	// TODO: Descriptions are temporarily disabled and this method is not called.
	// Rich descriptions will be added after designs have been prepared for all types of activity.
	//
	renderDescription() {
		const { log, moment, translate, applySiteOffset } = this.props;
		const { activityName, activityTs } = log;

		return (
			<div>
				<div>
					{ translate( 'An event "%(eventName)s" occurred at %(date)s', {
						args: {
							date: applySiteOffset( moment.utc( activityTs ) ).format( 'LLL' ),
							eventName: activityName,
						},
					} ) }
				</div>
				<div className="activity-log-item__id">ID { activityTs }</div>
			</div>
		);
	}

	renderHeader() {
		const { applySiteOffset, log, moment } = this.props;
		const { activityDescription, activityTitle } = log;

		return (
			<div className="activity-log-item__card-header">
				<ActivityActor
					{ ...pick( log, [ 'actorAvatarUrl', 'actorName', 'actorRole', 'actorType' ] ) }
				/>
				<div className="activity-log-item__description">
					{ ! activityDescription && activityTitle }
					{ activityDescription &&
						activityDescription.map( ( part, key ) => {
							if ( 'string' === typeof part ) {
								return part;
							}

							const { siteId, children, commentId, name, postId, type } = part;

							switch ( type ) {
								case 'comment':
									return (
										<a
											key={ key }
											href={ `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` }
										>
											{ children }
										</a>
									);

								case 'filepath':
									return (
										<div>
											<code>{ children }</code>
										</div>
									);

								case 'person':
									return (
										<a key={ key } href={ `/people/edit/${ siteId }/${ name }` }>
											<strong>{ children }</strong>
										</a>
									);

								case 'plugin':
									return (
										<a key={ key } href={ `/plugins/${ name }/${ siteId }` }>
											{ children }
										</a>
									);

								case 'post':
									return (
										<a key={ key } href={ `/read/blogs/${ siteId }/posts/${ postId }` }>
											<em>{ children }</em>
										</a>
									);

								case 'theme':
									return (
										<a key={ key } href={ part.url } target="_blank" rel="noopener noreferrer">
											<strong>
												<em>{ children }</em>
											</strong>
										</a>
									);

								case 'time':
									return applySiteOffset( moment.utc( part.time ) ).format( part.format );

								default:
									return null;
							}
						} ) }
					{ /*<div className="activity-log-item__event">{ eventName }</div>*/ }
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

	renderTime() {
		const { moment, log, applySiteOffset } = this.props;

		return (
			<div className="activity-log-item__time">
				{ applySiteOffset( moment.utc( log.activityTs ) ).format( 'LT' ) }
			</div>
		);
	}

	render() {
		const { className, log } = this.props;
		const { activityIcon, activityIsDiscarded, activityStatus } = log;

		const classes = classNames( 'activity-log-item', className, {
			'is-discarded': activityIsDiscarded,
		} );

		return (
			<div className={ classes }>
				<div className="activity-log-item__type">
					{ this.renderTime() }
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

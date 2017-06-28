/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import FoldableCard from 'components/foldable-card';
import Gravatar from 'components/gravatar';
import Gridicon from 'gridicons';
import PopoverMenuItem from 'components/popover/menu-item';
import { addQueryArgs } from 'lib/route';

class ActivityLogItem extends Component {

	static propTypes = {
		allowRestore: PropTypes.bool.isRequired,
		siteId: PropTypes.number.isRequired,
		requestRestore: PropTypes.func.isRequired,

		log: PropTypes.shape( {
			group: PropTypes.oneOf( [
				'attachment',
				'comment',
				'post',
				'term',
				'user',
			] ).isRequired,
			name: PropTypes.string.isRequired,
			ts_site: PropTypes.number.isRequired,
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

				post: PropTypes.shape( {
					id: PropTypes.number.isRequired,
					status: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					title: PropTypes.string.isRequired,
				} ),

				term: PropTypes.shape( {
					id: PropTypes.number.isRequired,
					title: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
				} ),

				user: PropTypes.shape( {
					display_name: PropTypes.string,
					login: PropTypes.string.isRequired,
					external_user_id: PropTypes.number,
					wpcom_user_id: PropTypes.number,
				} ),
			} ),
		} ).isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = { allowRestore: true };

	// TODO: Add analytics
	handleClickRestore = () => {
		const {
			requestRestore,
			log,
		} = this.props;
		requestRestore( log.ts_utc );
	};

	getIcon() {
		const { log } = this.props;
		const {
			group,
			name,
		} = log;

		switch ( name ) {
			// Inline return makes alphabetizing and searching easier :)
			case 'post__published': return 'create';
			case 'post__trashed': return 'trash';
			case 'user__registered': return 'user-add';
		}

		switch ( group ) {
			case 'attachment':
				return 'image';

			case 'comment':
				return 'comment';

			case 'post':
				return 'posts';

			case 'term':
				return 'folder';

			case 'user':
				return 'user';
		}

		return 'info-outline';
	}

	getStatus() {
		const { log } = this.props;
		const { name } = log;

		switch ( name ) {
			case 'comment__trashed':
			case 'post__trashed':
				return 'is-error';

			case 'attachment__uploaded':
			case 'comment__published':
			case 'post__published':
			case 'term__created':
			case 'user__registered':
				return 'is-success';

			case 'comment__published_awaiting_approval':
			case 'comment__unapproved':
				return 'is-warning';
		}
	}

	renderActor() {
		const { log } = this.props;
		const { actor } = log;

		if ( ! actor ) {
			return null;
		}

		const avatar_URL = actor.avatar_url
			? addQueryArgs( { s: 40 }, actor.avatar_url )
			: null;

		return (
			<div className="activity-log-item__actor">
				{ /*
					FIXME: actor does not correspond to a Gravatar user
					We need to receive `avatar_URL` from the endpoint or query users.
				*/ }
				<Gravatar user={ { avatar_URL } } size={ 40 } />
				<div className="activity-log-item__actor-info">
					<div className="activity-log-item__actor-name">{ actor.display_name }</div>
					<div className="activity-log-item__actor-role">{ actor.translated_role }</div>
				</div>
			</div>
		);
	}

	renderContent() {
		const { log } = this.props;
		const {
			name,
		} = log;

		const subTitle = null;

		return (
			<div className="activity-log-item__content">
				<div className="activity-log-item__content-title">{ name }</div>
				{ subTitle && <div className="activity-log-item__content-sub-title">{ subTitle }</div> }
			</div>
		);
	}

	// FIXME: Just for demonstration purposes
	renderDescription() {
		const {
			log,
			moment,
			translate,
		} = this.props;
		const {
			name,
			ts_site,
		} = log;

		return (
			<div>
				{ translate( 'An event "%(eventName)s" occurred at %(date)s', {
					args: {
						date: moment( ts_site ).format( 'LLL' ),
						eventName: name,
					}
				} ) }
			</div>
		);
	}

	renderHeader() {
		return (
			<div className="activity-log-item__card-header">
				{ this.renderActor() }
				{ this.renderContent() }
			</div>
		);
	}

	renderIcon() {
		const classes = classNames(
			'activity-log-item__icon',
			this.getStatus(),
		);
		const icon = this.getIcon();

		return ( icon &&
			<div className={ classes }>
				<Gridicon icon={ icon } size={ 24 } />
			</div>
		);
	}

	renderSummary() {
		const {
			allowRestore,
			translate,
		} = this.props;

		if ( ! allowRestore ) {
			return null;
		}

		return (
			<div className="activity-log-item__action">
				<EllipsisMenu position="bottom right">
					<PopoverMenuItem onClick={ this.handleClickRestore } icon="undo">
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
		} = this.props;

		return (
			<div className="activity-log-item__time">
				{ moment( log.ts_site ).format( 'LT' ) }
			</div>
		);
	}

	render() {
		const { className } = this.props;
		const classes = classNames(
			'activity-log-item',
			className
		);

		return (
			<div className={ classes } >
				<div className="activity-log-item__type">
					{ this.renderTime() }
					{ this.renderIcon() }
				</div>
				<FoldableCard
					className="activity-log-item__card"
					header={ this.renderHeader() }
					summary={ this.renderSummary() }
					expandedSummary={ this.renderSummary() }
				>
					{ this.renderDescription() }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( ActivityLogItem );

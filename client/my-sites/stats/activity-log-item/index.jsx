/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';
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

const debug = debugFactory( 'calypso:activity-log:item' );

class ActivityLogItem extends Component {

	static propTypes = {
		allowRestore: PropTypes.bool.isRequired,
		siteId: PropTypes.number.isRequired,
		requestRestore: PropTypes.func.isRequired,
		applySiteOffset: PropTypes.func.isRequired,
		log: PropTypes.shape( {
			group: PropTypes.oneOf( [
				'attachment',
				'comment',
				'core',
				'plugin',
				'post',
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

	static defaultProps = { allowRestore: true };

	// TODO: Add analytics
	handleClickRestore = () => {
		const {
			requestRestore,
			log,
		} = this.props;
		requestRestore( log.ts_utc );
	};

	handleOpen = () => debug( 'opened log', this.props.log );

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

			case 'theme':
				return 'themes';

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
			case 'theme__deleted':
				return 'is-error';

			case 'attachment__uploaded':
			case 'comment__published':
			case 'post__published':
			case 'term__created':
			case 'theme__installed':
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
			applySiteOffset,
		} = this.props;

		return (
			<div className="activity-log-item__time">
				{ applySiteOffset( moment.utc( log.ts_utc ) ).format( 'LT' ) }
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
					onOpen={ this.handleOpen }
				>
					{ this.renderDescription() }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( ActivityLogItem );

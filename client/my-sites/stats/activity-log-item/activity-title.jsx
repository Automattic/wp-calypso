/** @format */
/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { get } from 'lodash';

/**
 * TODO: This component is not localized. Much of the logic may be moved to the API so translation
 * was ignored during testing phases.
 */
class ActivityTitle extends Component {
	static propTypes = {
		action: PropTypes.string,

		actor: PropTypes.shape( {
			display_name: PropTypes.string,
			login: PropTypes.string,
		} ),

		name: PropTypes.string.isRequired,

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
					} )
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
				user_login_attempt: PropTypes.string,
			} ),

			widget: PropTypes.shape( {
				id: PropTypes.number,
				name: PropTypes.string,
				sidebar: PropTypes.string,
			} ),
		} ),
	};

	getActorName() {
		const { actor } = this.props;
		const displayName = get( actor, 'display_name' );
		if ( displayName ) {
			return displayName;
		}
		const login = get( actor, 'login' );
		if ( login ) {
			return login;
		}

		return 'An unknown user';
	}

	getAttachmentTitle() {
		const title = get( this.props.object, [ 'attachment', 'title' ] );
		if ( title ) {
			return title;
		}
		return 'an unknown attachment';
	}

	getCommentId() {
		return get( this.props.object, [ 'comment', 'id' ] );
	}

	getPluginName() {
		const pluginObject = get( this.props.object, 'plugin' );
		const getName = plugin => {
			const name = get( plugin, 'name' );
			if ( name ) {
				return name;
			}
			const slug = get( plugin, 'slug' );
			if ( slug ) {
				return slug;
			}
			return 'an unknown plugin';
		};
		return Array.isArray( pluginObject )
			? pluginObject.map( getName ).join( ', ' )
			: getName( pluginObject );
	}

	getPostTitle() {
		const title = get( this.props.object, [ 'post', 'title' ] );
		if ( title ) {
			return title;
		}
		return 'an unknown post';
	}

	getTermTitle() {
		const title = get( this.props.object, [ 'term', 'title' ] );
		if ( title ) {
			return title;
		}
		return 'an unknown term';
	}

	getThemeName() {
		const themeObject = get( this.props.object, 'theme' );
		const getName = theme => {
			const name = get( theme, 'name' );
			if ( name ) {
				return name;
			}
			const slug = get( theme, 'slug' );
			if ( slug ) {
				return slug;
			}
			return 'an unknown theme';
		};
		return Array.isArray( themeObject )
			? themeObject.map( getName ).join( ', ' )
			: getName( themeObject );
	}

	getUserName() {
		const user = get( this.props.object, 'user' );
		const displayName = get( user, 'display_name' );
		if ( displayName ) {
			return displayName;
		}
		const login = get( user, 'login' );
		if ( login ) {
			return login;
		}

		return 'an unknown user';
	}

	getWidgetName() {
		const name = get( this.props.object, 'widget', 'name' );
		if ( name ) {
			return name;
		}

		return 'a widget';
	}

	renderTitle() {
		const { name } = this.props;

		switch ( name ) {
			/**
			 * Attachment
			 */
			case 'attachment__deleted': {
				const actorName = this.getActorName();
				const attachmentTitle = this.getAttachmentTitle();
				return `${ actorName } deleted attachment ${ attachmentTitle }`;
			}
			case 'attachment__updated': {
				const actorName = this.getActorName();
				const attachmentTitle = this.getAttachmentTitle();
				return `${ actorName } updated attachment ${ attachmentTitle }`;
			}
			case 'attachment__uploaded': {
				const actorName = this.getActorName();
				return `${ actorName } added attachment`;
			}

			/**
			 * Comment
			 */
			case 'comment__approved': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } approved comment ${ commentId } on post ${ postTitle }`;
			}
			case 'comment__content_modified': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } modified comment ${ commentId } on post ${ postTitle }`;
			}
			case 'comment__deleted': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } deleted comment ${ commentId } from post ${ postTitle }`;
			}
			case 'comment__published': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } posted comment ${ commentId } on post ${ postTitle }`;
			}
			case 'comment__spammed': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } marked comment ${ commentId } as spam on post ${ postTitle }`;
			}
			case 'comment__trashed': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } trashed comment ${ commentId } on post ${ postTitle }`;
			}
			case 'comment__unapproved': {
				const actorName = this.getActorName();
				const commentId = this.getCommentId();
				const postTitle = this.getPostTitle();
				return `${ actorName } unapproved comment ${ commentId } on post ${ postTitle }`;
			}

			/**
			 * Menu
			 */
			case 'menu__added': {
				const actorName = this.getActorName();
				return `${ actorName } created a menu.`;
			}
			case 'menu__updated': {
				const actorName = this.getActorName();
				return `${ actorName } modified a menu.`;
			}

			/**
			 * Plugin
			 */
			case 'plugin__activated': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } activated plugin ${ pluginName }`;
			}
			case 'plugin__deactivated': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } deactivated plugin ${ pluginName }`;
			}
			case 'plugin__deleted': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } deleted plugin ${ pluginName }`;
			}
			case 'plugin__edited': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } modified plugin ${ pluginName }`;
			}
			case 'plugin__installed': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } installed plugin ${ pluginName }`;
			}
			case 'plugin__network_activated': {
				const pluginName = this.getPluginName();
				return `Plugin ${ pluginName } was network activated.`;
			}
			case 'plugin__update_available': {
				const pluginName = this.getPluginName();
				return `Plugin ${ pluginName } has an update available.`;
			}
			case 'plugin__updated': {
				const actorName = this.getActorName();
				const pluginName = this.getPluginName();
				return `${ actorName } updated plugin ${ pluginName }`;
			}

			/**
			 * Post
			 */
			case 'post__deleted': {
				const actorName = this.getActorName();
				const postTitle = this.getPostTitle();
				return `${ actorName } permanently deleted post ${ postTitle }.`;
			}
			case 'post__published': {
				const actorName = this.getActorName();
				const postTitle = this.getPostTitle();
				return `${ actorName } published post ${ postTitle }.`;
			}
			case 'post__trashed': {
				const actorName = this.getActorName();
				const postTitle = this.getPostTitle();
				return `${ actorName } trashed post ${ postTitle }.`;
			}
			case 'post__updated': {
				const actorName = this.getActorName();
				const postTitle = this.getPostTitle();
				return `${ actorName } modified post ${ postTitle }.`;
			}

			/**
			 * Rewind
			 * @FIXME: Need data from API and activity to produce relevant titles
			 */
			case 'rewind__complete':
				return 'A rewind was completed.';
			case 'rewind__error':
				return 'There was an error during rewind.';

			/**
			 * Term
			 */
			case 'term__created': {
				const actorName = this.getActorName();
				const termTitle = this.getTermTitle();
				return `${ actorName } created term ${ termTitle }.`;
			}
			case 'term__deleted': {
				const actorName = this.getActorName();
				const termTitle = this.getTermTitle();
				return `${ actorName } deleted term ${ termTitle }.`;
			}

			/**
			 * Theme
			 */
			case 'theme__deleted': {
				const actorName = this.getActorName();
				const themeName = this.getThemeName();
				return `${ actorName } deleted theme ${ themeName }.`;
			}
			case 'theme__edited': {
				const actorName = this.getActorName();
				const themeName = this.getThemeName();
				return `${ actorName } modified theme ${ themeName }.`;
			}
			case 'theme__installed': {
				const actorName = this.getActorName();
				const themeName = this.getThemeName();
				return `${ actorName } installed theme ${ themeName }.`;
			}
			case 'theme__network_disabled': {
				const themeName = this.getThemeName();
				return `Theme ${ themeName } was network deactivated.`;
			}
			case 'theme__network_enabled': {
				const themeName = this.getThemeName();
				return `Theme ${ themeName } was network activated.`;
			}
			case 'theme__switched': {
				const actorName = this.getActorName();
				const themeName = this.getThemeName();
				return `${ actorName } activated theme ${ themeName }.`;
			}
			case 'theme__update_available': {
				const themeName = this.getThemeName();
				return `Theme ${ themeName } has an update available.`;
			}
			case 'theme__updated': {
				const actorName = this.getActorName();
				const themeName = this.getThemeName();
				return `${ actorName } updated theme ${ themeName }.`;
			}

			/**
			 * User
			 */
			case 'user__added': {
				const actorName = this.getActorName();
				const userName = this.getUserName();
				return `${ actorName } added user ${ userName }.`;
			}
			case 'user__deleted': {
				const actorName = this.getActorName();
				const userName = this.getUserName();
				return `${ actorName } deleted user ${ userName }.`;
			}
			case 'user__failed_login_attempt': {
				const userLogin = get(
					this.props.object,
					[ 'user', 'user_login_attempt' ],
					'An unknown user'
				);
				return `${ userLogin } attempted and failed to login.`;
			}
			case 'user__login': {
				const userName = this.getUserName();
				return `${ userName } logged in successfully.`;
			}
			case 'user__registered': {
				const actorName = this.getActorName();
				const userName = this.getUserName();
				return `${ actorName } created user ${ userName }.`;
			}
			case 'user__removed': {
				const actorName = this.getActorName();
				const userName = this.getUserName();
				return `${ actorName } removed user ${ userName }.`;
			}
			case 'user__updated': {
				const actorName = this.getActorName();
				const userName = this.getUserName();
				return `${ actorName } modified user ${ userName }.`;
			}

			/**
			 * Widget
			 */
			case 'widget__added': {
				const actorName = this.getActorName();
				const widgetName = this.getWidgetName();
				return `${ actorName } added ${ widgetName } widget.`;
			}
			case 'widget__edited': {
				const actorName = this.getActorName();
				const widgetName = this.getWidgetName();
				return `${ actorName } modified ${ widgetName } widget.`;
			}
			case 'widget__removed': {
				const actorName = this.getActorName();
				const widgetName = this.getWidgetName();
				return `${ actorName } removed ${ widgetName } widget.`;
			}

			/**
			 * Default
			 *
			 * FIXME: This is placed here for testing purposes. It will help to identify missing
			 * activity. It should be removed and a robust fallback solution should be provided
			 * before this feature goes into production.
			 */
			default:
				return <em>{ `The activity ${ name } is missing a title.` }</em>;
		}
	}

	renderSubtitle() {
		return null;
	}

	render() {
		const subTitle = this.renderSubtitle();

		return (
			<div className="activity-log-item__title">
				<div className="activity-log-item__title-title">
					{ this.renderTitle() }
				</div>
				{ subTitle &&
					<div className="activity-log-item__title-subtitle">
						{ subTitle }
					</div> }
			</div>
		);
	}
}

export default ActivityTitle;

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

class ActivityTitle extends Component {

	static propTypes = {
		action: PropTypes.string,

		actor: PropTypes.shape( {
			display_name: PropTypes.string,
			login: PropTypes.string,
		} ),

		group: PropTypes.oneOf( [
			'attachment',
			'comment',
			'core',
			'menu',
			'plugin',
			'post',
			'term',
			'theme',
			'user',
			'widget',
		] ).isRequired,
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

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	getAction() {
		return this.props.action || this.props.name;
	}

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

	getObjectName() {
		const {
			group,
			object,
		} = this.props;

		switch ( group ) {
			case 'attachment': {
				const title = get( object, [ 'attachment', 'title' ] );
				if ( title ) {
					return title;
				}
				return 'an unknown attachment';
			}
			case 'comment': {
				const postTitle = get( object, [ 'post', 'title' ] );
				if ( postTitle ) {
					return `a comment on ${ postTitle }`;
				}
				return 'a comment on an unknown post';
			}
			case 'core':
				return 'WordPress Core';
			case 'menu': {
				const name = get( object, [ 'menu', 'name' ] );
				if ( name ) {
					return name;
				}
				return 'an unknown menu';
			}
			case 'plugin':
				return this.getPluginName( object );
			case 'post': {
				const title = get( object, [ 'post', 'title' ] );
				if ( title ) {
					return title;
				}
				return 'an unknown post';
			}
			case 'term': {
				const name = get( object, [ 'term', 'name' ] );
				if ( name ) {
					return name;
				}
				return 'an unknown term';
			}
			case 'theme':
				return this.getThemeName();
			case 'user':
				return this.getUserName();
			case 'widget':
				return 'a widget';
			default:
				return 'an unrecognized object';
		}
	}

	// FIXME: This function is built with the MVP in mind. It purposefully avoids translations which
	// will need to be revisited. They may be provided by the API.
	renderTitle() {
		const { group } = this.props;
		const actorName = this.getActorName();

		if (
			group === 'post' &&
			'customize_changeset' === get( this.props.object, [ 'post', 'type' ] )
		) {
			return (
				<div className="activity-log-item__title-title">
					{ `${ actorName } modified the site's customization` }
				</div>
			);
		}

		const action = this.getAction();
		const objectName = this.getObjectName();

		return (
			<div className="activity-log-item__title-title">
				{ `${ actorName } ${ action } ` }
				<em>{ objectName }</em>
			</div>
		);
	}

	renderSubtitle() {
		return null;
	}

	render() {
		const subTitle = this.renderSubtitle();

		return (
			<div className="activity-log-item__title">
				{ this.renderTitle() }
				{ subTitle && <div className="activity-log-item__title-subtitle">{ subTitle }</div> }
			</div>
		);
	}
}

export default localize( ActivityTitle );

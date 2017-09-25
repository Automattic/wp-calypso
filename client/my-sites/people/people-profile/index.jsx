/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

export default React.createClass( {
	displayName: 'PeopleProfile',

	mixins: [ PureRenderMixin ],

	getRole() {
		const user = this.props.user;
		if ( ! user ) {
			return 'subscriber';
		}

		if ( user && user.roles && user.roles[ 0 ] ) {
			return this.props.user.roles[ 0 ];
		}

		return;
	},

	getRoleBadgeText( role ) {
		let text;
		role = 'undefined' === typeof role ? this.getRole() : role;

		switch ( role ) {
			case 'super admin':
				text = this.translate( 'Super Admin', { context: 'Noun: A user role displayed in a badge' } );
				break;
			case 'administrator':
				text = this.translate( 'Admin', { context: 'Noun: A user role displayed in a badge' } );
				break;
			case 'editor':
				text = this.translate( 'Editor', { context: 'Noun: A user role displayed in a badge' } );
				break;
			case 'author':
				text = this.translate( 'Author', { context: 'Noun: A user role displayed in a badge' } );
				break;
			case 'contributor':
				text = this.translate( 'Contributor', { context: 'Noun: A user role displayed in a badge' } );
				break;
			case 'subscriber':
				text = this.translate( 'Subscriber', { context: 'Noun: A user role displayed in a badge' } );
				break;
			default:
				text = role;
		}

		return text;
	},

	getRoleBadgeClass( role ) {
		role = 'undefined' === typeof role ? this.getRole() : role;
		return 'role-' + role;
	},

	renderName() {
		const user = this.props.user;
		let name;
		if ( ! user ) {
			name = this.translate( 'Loading Users', { context: 'Placeholder text while fetching users.' } );
		} else if ( user.name ) {
			name = user.name;
		} else if ( user.label ) {
			name = user.label;
		}

		if ( name ) {
			name = (
				<div className="people-profile__username">
					{ name }
				</div>
			);
		}

		return name;
	},

	renderLogin() {
		let login;
		if ( ! this.props.user ) {
			login = this.translate( 'Loading Users', { context: 'Placeholder text while fetching users.' } );
		} else if ( this.props.user.login ) {
			login = this.props.user.login;
		}

		if ( login ) {
			login = (
				<div className="people-profile__login">
					<span>@{ login }</span>
				</div>
			);
		}

		return login;
	},

	renderRole() {
		let superAdminBadge,
			roleBadge;

		if ( this.props.user && this.props.user.is_super_admin ) {
			superAdminBadge = (
				<div className="people-profile__role-badge role-super-admin">
					{ this.getRoleBadgeText( 'super admin' ) }
				</div>
			);
		}

		if ( this.getRole() ) {
			roleBadge = (
				<div className={ classNames( 'people-profile__role-badge', this.getRoleBadgeClass() ) }>
					{ this.getRoleBadgeText() }
				</div>
			);
		}

		if ( ! roleBadge && ! superAdminBadge ) {
			return;
		}

		return (
			<div className="people-profile__badges">
				{ superAdminBadge }
				{ roleBadge }
			</div>
		);
	},

	renderSubscribedDate() {
		if ( ! this.props.user || ! this.props.user.date_subscribed ) {
			return;
		}

		return (
			<div className="people-profile__subscribed">
				{
					this.translate( 'Since %(formattedDate)s', {
						context: 'How long a user has been subscribed to a blog. Example: "Since Sep 16, 2015"',
						args: {
							formattedDate: this.moment( this.props.user.date_subscribed ).format( 'll' )
						}
					} )
				}
			</div>
		);
	},

	isFollowerType() {
		return this.props.user && ! this.props.user.roles && this.props.user.date_subscribed;
	},

	render: function() {
		const user = this.props.user,
			classes = classNames( 'people-profile', {
				'is-placeholder': ! user
			} );

		return (
			<div { ...omit( this.props, 'className', 'user' ) } className={ classes }>
				<div className="people-profile__gravatar">
					<Gravatar user={ user } size={ 72 } />
				</div>
				<div className="people-profile__detail">
					{ this.renderName() }
					{ this.renderLogin() }
					{ this.isFollowerType() ? this.renderSubscribedDate() : this.renderRole() }
				</div>
			</div>
		);
	}
} );

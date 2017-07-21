/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

export default class ActivityIcon extends PureComponent {

	static propTypes = {
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
	};

	getIcon() {
		const {
			group,
			name,
		} = this.props;

		switch ( name ) {
			// Inline return makes alphabetizing and searching easier :)
			case 'post__published': return 'create';
			case 'post__trashed': return 'trash';
		}

		switch ( group ) {
			case 'attachment':
				return 'image';

			case 'comment':
				return 'comment';

			case 'core':
				return 'my-sites';

			case 'menu':
				return 'menu';

			case 'plugin':
				return 'plugins';

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
		const { name } = this.props;

		switch ( name ) {
			case 'widget__removed':
				return 'is-error';

			case 'attachment__uploaded':
			case 'plugin__autoupdated':
			case 'plugin__installed':
			case 'plugin__installed_filesystem':
			case 'term__created':
			case 'theme__installed':
			case 'user__registered':
				return 'is-success';

			case 'comment__published_awaiting_approval':
			case 'comment__unapproved':
			case 'plugin__update_available':
				return 'is-warning';
		}

		// Try matching the "verb" part of the name
		const suffix = name.split( '__' )[ 1 ];
		switch ( suffix ) {
			case 'deleted':
			case 'trashed':
				return 'is-error';

			case 'published':
				return 'is-success';
		}
	}

	render() {
		const icon = this.getIcon();
		const classes = classNames( 'activity-log-item__activity-icon', this.getStatus() );

		return (
			<div className={ classes }>
				<Gridicon icon={ icon } size={ 24 } />
			</div>
		);
	}
}

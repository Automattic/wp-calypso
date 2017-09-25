/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { head, split } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class ActivityIcon extends PureComponent {

	static propTypes = {
		activityName: PropTypes.string.isRequired,
		activityIcon: PropTypes.string.isRequired,
	};

	getStatus() {
		const { activityName } = this.props;

		switch ( activityName ) {
			case 'widget__removed':
				return 'is-error';

			case 'plugin__autoupdated':
			case 'plugin__installed':
			case 'plugin__installed_filesystem':
			case 'theme__installed':
			case 'user__registered':
				return 'is-success';

			case 'comment__published_awaiting_approval':
			case 'comment__unapproved':
			case 'plugin__update_available':
				return 'is-warning';
		}

		// Try matching the "verb" part of the name
		const suffix = head( split( activityName, '__', 1 ) );
		switch ( suffix ) {
			case 'deleted':
			case 'error':
			case 'trashed':
				return 'is-error';

			case 'published':
				return 'is-success';
		}
	}

	render() {
		const { activityIcon } = this.props;
		const classes = classNames( 'activity-log-item__activity-icon', this.getStatus() );

		return (
			<div className={ classes }>
				<Gridicon icon={ activityIcon } size={ 24 } />
			</div>
		);
	}
}

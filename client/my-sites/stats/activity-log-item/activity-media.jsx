/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';

export default class ActivityMedia extends PureComponent {
	static propTypes = {
		icon: PropTypes.string,
		screenshot: PropTypes.string,
		name: PropTypes.string,
	};

	render() {
		const { icon, screenshot } = this.props;
		const classes = classNames( 'activity-log-item__activity-media', icon && `is-${ icon }` );

		return (
			<div className={ classes }>
				{ icon && <Gridicon icon={ icon } size={ 24 } /> }
				{ screenshot && <img src={ screenshot } alt={ name } /> }
			</div>
		);
	}
}

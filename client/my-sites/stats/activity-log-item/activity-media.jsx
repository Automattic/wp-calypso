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
		icon: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		thumbnail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		name: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
	};

	render() {
		const { icon, thumbnail, name } = this.props;
		const classes = classNames( 'activity-log-item__activity-media', icon && `has-gridicon` );

		return (
			<div className={ classes }>
				{ icon && <Gridicon icon={ icon } size={ 48 } /> }
				{ thumbnail && <img src={ thumbnail } alt={ name } /> }
			</div>
		);
	}
}

/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

class StatsError extends React.PureComponent {
	static displayName = 'StatsError';

	static propTypes = {
		message: PropTypes.string,
		className: PropTypes.string,
	};

	render() {
		const message =
			this.props.message ||
			this.props.translate( "Some stats didn't load in time. Please try again later." );

		return (
			<div className={ classNames( 'module-content-text', 'is-error', this.props.className ) }>
				<p>{ message }</p>
			</div>
		);
	}
}

export default localize( StatsError );

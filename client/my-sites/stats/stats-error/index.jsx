/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class StatsError extends React.PureComponent {
	static displayName = 'StatsError';

	static propTypes = {
		message: PropTypes.string,
		className: PropTypes.string,
	};

	render() {
		const { children, className, message, translate } = this.props;
		const displayedMessage =
			message || translate( "Some stats didn't load in time. Please try again later." );

		return (
			<div className={ classNames( 'module-content-text', 'is-error', className ) }>
				<p key="primary">{ displayedMessage }</p>
				{ children }
			</div>
		);
	}
}

export default localize( StatsError );

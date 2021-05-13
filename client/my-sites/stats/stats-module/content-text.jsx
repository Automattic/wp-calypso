/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

export default class extends React.Component {
	static displayName = 'StatsModuleContentText';

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		return (
			<div className={ classNames( 'module-content-text', this.props.className ) }>
				{ this.props.children }
			</div>
		);
	}
}

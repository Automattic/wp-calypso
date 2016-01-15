/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'StatsModulePlaceholder',

	propTypes: {
		className: PropTypes.string
	},

	render() {
		const { className } = this.props;
		return ( <div className={ classNames( 'stats-module__placeholder', 'is-void', className ) } /> );
	}
} );

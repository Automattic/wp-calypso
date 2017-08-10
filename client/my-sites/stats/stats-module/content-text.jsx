/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'StatsModuleContentText',

	propTypes: {
		className: PropTypes.string,
	},
	render() {
		return (
			<div className={ classNames( 'module-content-text', this.props.className ) }>
				{ this.props.children }
			</div>
		);
	},
} );

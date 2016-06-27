/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'StatsModulePlaceholder',

	propTypes: {
		className: PropTypes.string,
		isLoading: PropTypes.bool
	},

	render() {
		const { className, isLoading } = this.props;

		if ( ! isLoading ) {
			return null;
		}

		const classes = classNames( 'stats-module__placeholder', 'is-void', className );

		return ( <Spinner className={ classes } /> );
	}
} );

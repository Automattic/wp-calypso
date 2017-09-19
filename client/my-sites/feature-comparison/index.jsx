/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default React.createClass( {

	displayName: 'FeatureComparison',

	propTypes: {
		className: PropTypes.string
	},

	render() {
		const classes = classNames( this.props.className, 'feature-comparison' );
		return (
			<Card compact className={ classes } >
				{ this.props.children }
			</Card>
		);
	}
} );

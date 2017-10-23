/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-pure-render/mixin';

const StatsError = React.createClass( {
	displayName: 'StatsError',

	mixins: [ PureRenderMixin ],

	propTypes: {
		message: PropTypes.string,
		className: PropTypes.string,
	},

	render() {
		const message =
			this.props.message ||
			this.props.translate( "Some stats didn't load in time. Please try again later." );

		return (
			<div className={ classNames( 'module-content-text', 'is-error', this.props.className ) }>
				<p>{ message }</p>
			</div>
		);
	},
} );

export default localize( StatsError );

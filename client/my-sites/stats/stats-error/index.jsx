/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import PureRenderMixin from 'react-pure-render/mixin';

export default localize( React.createClass( {
	displayName: 'StatsError',

	mixins: [ PureRenderMixin ],

	propTypes: {
		message: PropTypes.string,
		className: PropTypes.string
	},

	render() {
		const message = this.props.message || this.props.translate( "Some stats didn't load in time. Please try again later." );

		return (
			<div className={ classNames( 'module-content-text', 'is-error', this.props.className ) }>
				<p>{ message }</p>
			</div>
		);
	}
} ) );

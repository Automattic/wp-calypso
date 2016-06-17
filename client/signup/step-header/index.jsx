/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';

module.exports = React.createClass( {
	displayName: 'StepHeader',

	propTypes: {
		headerText: PropTypes.string,
		subHeaderText: React.PropTypes.node
	},

	render: function() {
		return (
			<header className="step-header">
				<h1 className="step-header__title">{ preventWidows( this.props.headerText, 2 ) }</h1>
				<p className="step-header__subtitle">{ preventWidows( this.props.subHeaderText, 2 ) }</p>
			</header>
		);
	}
} );

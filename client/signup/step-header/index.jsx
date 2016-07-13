/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

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
		const { headerText, subHeaderText } = this.props;
		const classes = classNames( 'step-header', {
			'is-without-subhead': ! subHeaderText
		} );
		return (
			<header className={ classes }>
				<h1 className="step-header__title">{ preventWidows( headerText, 2 ) }</h1>
				{ subHeaderText && <p className="step-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p> }
			</header>
		);
	}
} );

/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'StepHeader',

	render: function() {
		return (
			<header className="step-header">
				<h1 className="step-header__title">{ this.props.headerText }</h1>
				<p className="step-header__subtitle">{ this.props.subHeaderText }</p>
			</header>
		);
	}
} );

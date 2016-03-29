/**
 * External dependencies
 */
var classNames = require( 'classnames' ),
	React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'PlanHeader',

	render: function() {
		var classes = classNames( {
			'plan-header': true,
			'is-placeholder': this.props.isPlaceholder
		} );

		return (
			<div className={ classes }>
				<h2 className="plan-header__title">{ this.props.text }</h2>

				{ this.props.children }
			</div>
		);
	}
} );

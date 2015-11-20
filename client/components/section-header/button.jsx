/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' );

var peopleSectionHeaderButton = React.createClass( {

	getDefaultProps: function() {
		return {
			className: ''
		};
	},

	render: function() {
		var buttonClasses = classNames(
			'button',
			'section-header__button',
			this.props.className
		);

		return (
			<button
				{ ...omit( this.props, 'className' ) }
				className={ buttonClasses }
			>
				{ this.props.children }
			</button>
		);
	}
} );

module.exports = peopleSectionHeaderButton;

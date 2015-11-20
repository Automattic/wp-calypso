/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsPreviewAction',

	propTypes: {
		active: React.PropTypes.bool,
		position: React.PropTypes.oneOf( [
			'top-left',
			'top-right',
			'bottom-left',
			'bottom-right'
		] ),
		icon: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			active: true,
			position: 'top-left',
			onClick: function() {}
		};
	},

	getIconElement: function() {
		if ( this.props.icon ) {
			return <span className={ 'noticon noticon-' + this.props.icon } />;
		}
	},

	render: function() {
		var classes = classNames( 'sharing-buttons-preview-action', {
			'is-active': this.props.active,
			'is-top': 0 === this.props.position.indexOf( 'top' ),
			'is-right': -1 !== this.props.position.indexOf( '-right' ),
			'is-bottom': 0 === this.props.position.indexOf( 'bottom' ),
			'is-left': -1 !== this.props.position.indexOf( '-left' )
		} );

		return (
			<button type="button" className={ classes } { ...this.props }>
				{ this.getIconElement() }
				{ this.props.children }
			</button>
		);
	}
} );

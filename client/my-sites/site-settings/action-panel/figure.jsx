/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Main
 */
var ActionPanelFigure = React.createClass( {

	propTypes: {
		inlineBodyText: React.PropTypes.bool // above `480px` does figure align with body text (below title)
	},

	getDefaultProps: function() {
		return {
			inlineBodyText: false
		};
	},

	render: function() {
		var figureClasses = classNames( {
			'settings-action-panel__figure': true,
			'is-inline-body-text': this.props.inlineBodyText
		} );

		return (
			<div className={ figureClasses }>
				{ this.props.children }
			</div>
		);
	}

} );

module.exports = ActionPanelFigure;

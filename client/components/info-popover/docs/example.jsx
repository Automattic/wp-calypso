/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
* Internal dependencies
*/
var InfoPopover = require( 'components/info-popover' );

var InfoPopoverExample = React.createClass( {
	displayName: 'InfoPopover',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			popoverPosition: 'bottom left',
		};
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/info-popover">Info Popover</a>
				</h2>
				<label>Position
					<select value={ this.state.popoverPosition } onChange={ this._changePopoverPosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</select>
				</label>

				<br />

				<InfoPopover
					id="popover__info-popover-example"
					position={ this.state.popoverPosition }
				>
					Some informational text.
				</InfoPopover>

			</div>
		);
	},

	_changePopoverPosition: function( event ) {
		this.setState( { popoverPosition: event.target.value } );
	}

} );

module.exports = InfoPopoverExample;

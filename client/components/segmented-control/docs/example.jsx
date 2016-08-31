/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var SegmentedControl = require( 'components/segmented-control' ),
	ControlItem = require( 'components/segmented-control/item' );

/**
 * Segmented Control Demo
 */
var SegmentedControlDemo = React.createClass( {
	displayName: 'SegmentedControl',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			childSelected: 'all',
			compact: false
		};
	},

	getDefaultProps: function() {
		return {
			options: [
				{ value: 'all', label: 'All' },
				{ value: 'unread', label: 'Unread' },
				{ value: 'comments', label: 'Comments' },
				{ value: 'follows', label: 'Follows' },
				{ value: 'likes', label: 'Likes' }
			]
		};
	},

	toggleCompact: function() {
		this.setState( { compact: ! this.state.compact } );
	},

	render: function() {
		var controlDemoStyles = { maxWidth: 386 };

		return (
			<div>
				<a className="design-assets__toggle button" onClick={ this.toggleCompact }>
						{ this.state.compact ? 'Normal' : 'Compact' }
					</a>

				<h3>Items passed as options prop</h3>
				<SegmentedControl
					options={ this.props.options }
					onSelect={ this.selectSegment }
					style={ controlDemoStyles }
					compact={ this.state.compact }
				/>

				<h3 style={ { marginTop: 20 } }>Primary version</h3>
				<SegmentedControl
					selectedText={ this.state.childSelected }
					style={ controlDemoStyles }
					primary={ true }
					compact={ this.state.compact }
				>
					<ControlItem
						selected={ this.state.childSelected === 'all' }
						onClick={ this.selectChildSegment.bind( this, 'all' ) }
					>
						All
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'unread' }
						onClick={ this.selectChildSegment.bind( this, 'unread' ) }
					>
						Unread
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'comments' }
						onClick={ this.selectChildSegment.bind( this, 'comments' ) }
					>
						Comments
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'follows' }
						onClick={ this.selectChildSegment.bind( this, 'follows' ) }
					>
						Follows
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'likes' }
						onClick={ this.selectChildSegment.bind( this, 'likes' ) }
					>
						Likes
					</ControlItem>
				</SegmentedControl>

				<h3 style={ { marginTop: 20 } }>Three items</h3>
				<SegmentedControl
					compact={ this.state.compact }
					selectedText={ this.state.childSelected }
					style={ { maxWidth: 280 } }
				>
					<ControlItem
						selected={ this.state.childSelected === 'all' }
						onClick={ this.selectChildSegment.bind( this, 'all' ) }
					>
						All
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'unread' }
						onClick={ this.selectChildSegment.bind( this, 'unread' ) }
					>
						Unread
					</ControlItem>

					<ControlItem
						selected={ this.state.childSelected === 'comments' }
						onClick={ this.selectChildSegment.bind( this, 'comments' ) }
					>
						Comments
					</ControlItem>
				</SegmentedControl>
			</div>
		);
	},

	selectChildSegment: function( childSelected, event ) {
		event.preventDefault();
		this.setState( {
			childSelected: childSelected
		} );
		console.log( 'Segmented Control (selected):', childSelected );
	},

	selectSegment: function( option ) {
		console.log( 'Segmented Control (selected):', option );
	}
} );

module.exports = SegmentedControlDemo;

/**
 * External dependencies
 */
var React = require( 'react' );

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

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			childSelected: 'all'
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

	render: function() {
		var controlDemoStyles = { maxWidth: 386 };

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/segmented-control">Segmented Control</a>
				</h2>

				<h3>Items passed as options prop</h3>
				<SegmentedControl
					options={ this.props.options }
					onSelect={ this.selectSegment }
					style={ controlDemoStyles }
				/>

				<h3 style={ { marginTop: 20 } }>items passed as children</h3>
				<SegmentedControl
					selectedText={ this.state.childSelected }
					style={ controlDemoStyles }
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

				<h3 style={ { marginTop: 20 } }>Compact version of segmented control</h3>
				<SegmentedControl
					compact={ true }
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

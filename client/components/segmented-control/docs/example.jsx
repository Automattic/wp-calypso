/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import ControlItem from 'components/segmented-control/item';

class SegmentedControlDemo extends React.PureComponent {
	static displayName = 'SegmentedControl';

	static defaultProps = {
		options: [
			{ value: 'all', label: 'All' },
			{ value: 'unread', label: 'Unread' },
			{ value: 'comments', label: 'Comments' },
			{ value: 'follows', label: 'Follows' },
			{ value: 'likes', label: 'Likes' },
		],
	};

	state = {
		childSelected: 'all',
		compact: false,
	};

	toggleCompact = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		var controlDemoStyles = { maxWidth: 386 };

		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleCompact }>
					{ this.state.compact ? 'Normal' : 'Compact' }
				</a>

				<h3>Items passed as options prop</h3>
				<SimplifiedSegmentedControl
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
	}

	selectChildSegment = ( childSelected, event ) => {
		event.preventDefault();
		this.setState( {
			childSelected: childSelected,
		} );
		console.log( 'Segmented Control (selected):', childSelected );
	};

	selectSegment = option => {
		console.log( 'Segmented Control (selected):', option );
	};
}

export default SegmentedControlDemo;

/**
 * External Dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import ControlItem from 'components/segmented-control/item';
import SegmentedControl from 'components/segmented-control';

/**
 * Internal variables
 */
let _instance = 1;

/**
 * Main
 */
const NavSegmented = React.createClass( {

	propTypes: {
		label: React.PropTypes.string,
		hasSiblingControls: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			hasSiblingControls: false
		};
	},

	componentWillMount: function() {
		this.id = _instance;
		_instance++;
	},

	render: function() {
		const segmentedClassName = classNames( {
			'section-nav-group': true,
			'section-nav__segmented': true,
			'has-siblings': this.props.hasSiblingControls
		} );

		return (
			<div className={ segmentedClassName }>
				{
					this.props.label &&
					<h6 className="section-nav-group__label">{ this.props.label }</h6>
				}

				<SegmentedControl>
					{ this.getControlItems() }
				</SegmentedControl>
			</div>
		);
	},

	getControlItems: function() {
		return React.Children.map( this.props.children, function( child, index ) {
			return (
				<ControlItem
					{ ...child.props }
					key={ 'navSegmented-' + this.id + '-' + index }
				>
					{ child.props.children }
				</ControlItem>
			);
		}, this );
	}
} );

module.exports = NavSegmented;

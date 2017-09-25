/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';

/**
 * Internal variables
 */
let _instance = 1;

/**
 * Main
 */
class NavSegmented extends Component {
	static propTypes = {
		label: PropTypes.string,
		hasSiblingControls: PropTypes.bool
	};

	static defaultProps = {
		hasSiblingControls: false
	};

	componentWillMount() {
		this.id = _instance;
		_instance++;
	}

	render() {
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
	}

	getControlItems = () => {
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
	};
}

export default NavSegmented;

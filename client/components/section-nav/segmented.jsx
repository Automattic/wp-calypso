/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import SegmentedControl from 'calypso/components/segmented-control';

/**
 * Style dependencies
 */
import './segmented.scss';

class NavSegmented extends Component {
	static propTypes = {
		label: PropTypes.string,
		hasSiblingControls: PropTypes.bool,
	};

	static defaultProps = {
		hasSiblingControls: false,
	};

	render() {
		const segmentedClassName = classNames( 'section-nav-group', 'section-nav__segmented', {
			'has-siblings': this.props.hasSiblingControls,
		} );

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className={ segmentedClassName }>
				{ this.props.label && <h6 className="section-nav-group__label">{ this.props.label }</h6> }

				<SegmentedControl>{ this.getControlItems() }</SegmentedControl>
			</div>
			/* eslint-enable wpcalyspo/jsx-classname-namespace */
		);
	}

	getControlItems() {
		return React.Children.map( this.props.children, ( child, index ) => (
			<SegmentedControl.Item { ...child.props } key={ index } />
		) );
	}
}

export default NavSegmented;

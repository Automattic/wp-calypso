import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Children, Component } from 'react';

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
		const segmentedClassName = clsx( 'section-nav-group', 'section-nav__segmented', {
			'has-siblings': this.props.hasSiblingControls,
		} );

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className={ segmentedClassName }>
				{ this.props.label && <h6 className="section-nav-group__label">{ this.props.label }</h6> }
				<SegmentedControl>{ this.getControlItems() }</SegmentedControl>
			</div>
		);
	}

	getControlItems() {
		return Children.map( this.props.children, ( child, index ) => (
			<SegmentedControl.Item { ...child.props } key={ index } />
		) );
	}
}

export default NavSegmented;

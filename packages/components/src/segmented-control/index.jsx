import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SegmentedControlItem from './item';

import './style.scss';

export default class SegmentedControl extends Component {
	static Item = SegmentedControlItem;

	static propTypes = {
		className: PropTypes.string,
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		style: PropTypes.object,
		children: PropTypes.node.isRequired,
	};

	render() {
		const segmentedClasses = {
			'is-compact': this.props.compact,
			'is-primary': this.props.primary,
		};

		return (
			<ul
				className={ clsx( 'segmented-control', segmentedClasses, this.props.className ) }
				style={ this.props.style }
				role="radiogroup"
			>
				{ this.props.children }
			</ul>
		);
	}
}

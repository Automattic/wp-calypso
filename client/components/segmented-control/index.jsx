/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SegmentedControlItem from './item';

/**
 * Style dependencies
 */
import './style.scss';

export default class SegmentedControl extends React.Component {
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
				className={ classNames( 'segmented-control', segmentedClasses, this.props.className ) }
				style={ this.props.style }
				role="radiogroup"
			>
				{ this.props.children }
			</ul>
		);
	}
}

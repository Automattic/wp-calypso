/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

export default class SegmentedControl extends React.Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
		compact: PropTypes.bool,
		onSelect: PropTypes.func,
		style: PropTypes.object,
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

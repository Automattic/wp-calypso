/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ControlItem from 'components/segmented-control/item';

export default class SimplifiedSegmentedControl extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		compact: PropTypes.bool,
		initialSelected: PropTypes.string,
		onSelect: PropTypes.func,
		options: PropTypes.arrayOf(
			PropTypes.shape( {
				value: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired,
				path: PropTypes.string,
			} )
		).isRequired,
		style: PropTypes.object,
	};
	state = { selected: this.props.initialSelected || this.props.options[ 0 ].value };

	renderOptions() {
		return this.props.options.map( ( option, index ) => (
			<ControlItem
				index={ index }
				key={ index }
				onClick={ () => {
					this.setState( { selected: option.value } );
					this.props.onSelect && this.props.onSelect( option );
				} }
				path={ option.path }
				selected={ this.state.selected === option.value }
				value={ option.value }
			>
				{ option.label }
			</ControlItem>
		) );
	}

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
				{ this.renderOptions() }
			</ul>
		);
	}
}

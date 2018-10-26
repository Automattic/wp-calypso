/** @format */

/**
 * External dependencies
 */

import { Component, Fragment } from '@wordpress/element';
import { Button, ButtonGroup } from '@wordpress/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

import './style.scss';

export class MapThemePicker extends Component {
	render() {
		const { options, value, onChange, label } = this.props;
		const buttons = options.map( ( option, index ) => {
			const classes = classnames(
				'component__map-theme-picker__button',
				'is-theme-' + option.value,
				option.value === value ? 'is-selected' : ''
			);
			return (
				<Button
					className={ classes }
					title={ option.label }
					key={ index }
					onClick={ () => onChange( option.value ) }
				>
					{ option.label }
				</Button>
			);
		} );
		return (
			<Fragment>
				<label className="components-base-control__label">{ label }</label>
				<ButtonGroup>{ buttons }</ButtonGroup>
			</Fragment>
		);
	}
}

MapThemePicker.defaultProps = {
	label: '',
	options: [],
	value: null,
	onChange: () => {},
};

export default MapThemePicker;

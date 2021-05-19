/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { Disabled, ToggleControl } from '@wordpress/components';

const noop = () => {};

export default class FormToggle extends PureComponent {
	static propTypes = {
		onChange: PropTypes.func,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		id: PropTypes.string,
		help: PropTypes.node,
	};

	static defaultProps = {
		checked: false,
		disabled: false,
		onChange: noop,
	};

	render() {
		const { checked, children, disabled, help, id, onChange } = this.props;

		return (
			<Disabled isDisabled={ disabled }>
				<ToggleControl
					id={ id }
					onChange={ onChange }
					checked={ checked }
					label={ children }
					help={ help }
				/>
			</Disabled>
		);
	}
}

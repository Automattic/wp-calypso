/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Disableable from 'calypso/components/disableable';

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
			<Disableable disabled={ disabled }>
				<ToggleControl
					id={ id }
					onChange={ onChange }
					checked={ checked }
					label={ children }
					help={ help }
				/>
			</Disableable>
		);
	}
}

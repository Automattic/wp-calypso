/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import SubComponent from './sub-component';

/**
 * Style dependencies
 */
import './style.scss';

const DesignPicker: React.FC = () => {
	const { __ } = useI18n();
	const label = __( 'Hello world, Design Picker', __i18n_text_domain__ );

	return (
		<div className="design-picker">
			{ label }
			<SubComponent />
		</div>
	);
};

export default DesignPicker;

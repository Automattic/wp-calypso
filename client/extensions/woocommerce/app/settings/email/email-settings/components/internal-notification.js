/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const InternalNotification = ( { item, recipient, checked, onToggle, onChange } ) => (
	<div className="components__notification-component">
		<span className="components__notification-component-title" >
			<FormLabel>
				{ item.title }
			</FormLabel>
			<FormSettingExplanation>
				{ item.subtitle }
			</FormSettingExplanation>
		</span>
		<FormTextInput
			className="components__notification-component-input"
			name={ item.field }
			onChange={ onChange }
			value={ recipient }
		/>
		<span className="components__notification-component-toggle">
			<CompactFormToggle
				checked={ checked }
				onChange={ onToggle }
				id={ item.field }
			/>
		</span>
	</div>
);

InternalNotification.propTypes = {
	checked: PropTypes.bool,
	recipient: PropTypes.string,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default InternalNotification ;

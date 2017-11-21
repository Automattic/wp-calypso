/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const CustomerNotification = ( { item, checked, onToggle } ) => (
	<Card className="components__notification-component">
		<span className="components__notification-component-title" >
			<FormLabel>
				{ item.title }
			</FormLabel>
			<FormSettingExplanation>
				{ item.subtitle }
			</FormSettingExplanation>
		</span>
		<span className="components__notification-component-toggle">
		<CompactFormToggle
				checked={ checked }
				onChange={ onToggle }
				id={ item.field }
			/>
		</span>
	</Card>
);

CustomerNotification.propTypes = {
	checked: PropTypes.bool,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
};

export default CustomerNotification ;

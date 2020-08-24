/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SettingsItem from './settings-item';
import SettingsGroupCard from 'woocommerce/woocommerce-services/components/settings-group-card';

const SettingsGroup = ( props ) => {
	const { group, errors } = props;

	const renderSettingsItem = ( item ) => {
		const itemKey = item.key ? item.key : item;

		return (
			<SettingsItem
				{ ...props }
				key={ itemKey }
				layout={ item }
				errors={ errors[ itemKey ] || {} }
			/>
		);
	};

	const renderSettingsItems = () => {
		return group.items.map( ( item, idx ) => (
			<div className="settings-form__row" key={ idx }>
				{ renderSettingsItem( item ) }
			</div>
		) );
	};

	switch ( group.type ) {
		case 'fieldset':
			return (
				<SettingsGroupCard heading={ group.title }>{ renderSettingsItems() }</SettingsGroupCard>
			);

		case 'actions':
			return null; // The "save" button will be outside the form

		default:
			return <div>{ renderSettingsItems() }</div>;
	}
};

SettingsGroup.propTypes = {
	group: PropTypes.shape( {
		title: PropTypes.string,
		items: PropTypes.array,
	} ),
	schema: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.object,
	site: PropTypes.object.isRequired,
};

export default SettingsGroup;

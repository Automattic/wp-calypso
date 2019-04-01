/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import FormButtonsBar from 'components/forms/form-buttons-bar';

/**
 * Style dependencies
 */
import './style.scss';

export default function DomainManagementFormFooter( { children } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <FormButtonsBar className="domain-management-form-footer">{ children }</FormButtonsBar>;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

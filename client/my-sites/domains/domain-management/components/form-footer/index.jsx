/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormButtonsBar from 'components/forms/form-buttons-bar';

const DomainManagementFormFooter = React.createClass( {
	render() {
		return (
			<FormButtonsBar className="domain-management-form-footer">
				{ this.props.children }
			</FormButtonsBar>
		);
	},
} );

export default DomainManagementFormFooter;

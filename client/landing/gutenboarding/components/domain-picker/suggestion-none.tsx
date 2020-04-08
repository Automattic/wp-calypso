/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';

const DomainPickerSuggestionItem: FunctionComponent = () => {
	const { __ } = useI18n();

	return <div className="domain-picker__suggestion-none">{ __( 'No matching domains.' ) }</div>;
};

export default DomainPickerSuggestionItem;

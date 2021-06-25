/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';

const SettingsSectionHeader = ( {
	children,
	disabled,
	id,
	isSaving,
	onButtonClick,
	showButton,
	title,
	numberFormat,
	...buttonProps
} ) => {
	const translate = useTranslate();

	return (
		<SectionHeader label={ title } id={ id }>
			{ children }
			{ showButton && (
				<Button compact primary onClick={ onButtonClick } disabled={ disabled } { ...buttonProps }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save settings' ) }
				</Button>
			) }
		</SectionHeader>
	);
};

SettingsSectionHeader.propTypes = {
	disabled: PropTypes.bool,
	id: PropTypes.string,
	isSaving: PropTypes.bool,
	onButtonClick: PropTypes.func,
	showButton: PropTypes.bool,
	title: PropTypes.string.isRequired,

	// from localize() HoC
	translate: PropTypes.func,
};

export default SettingsSectionHeader;

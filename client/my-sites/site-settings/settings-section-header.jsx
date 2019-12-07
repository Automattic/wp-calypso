/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SectionHeader from 'components/section-header';

const SettingsSectionHeader = ( {
	children,
	disabled,
	id,
	isSaving,
	onButtonClick,
	showButton,
	title,
	translate,
	moment,
	numberFormat,
	...buttonProps
} ) => {
	return (
		<SectionHeader label={ title } id={ id }>
			{ children }
			{ showButton && (
				<Button compact primary onClick={ onButtonClick } disabled={ disabled } { ...buttonProps }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
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

export default localize( SettingsSectionHeader );

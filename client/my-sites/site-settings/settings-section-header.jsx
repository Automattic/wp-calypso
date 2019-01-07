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
	disabled,
	isSaving,
	onButtonClick,
	showButton,
	title,
	translate,
} ) => {
	return (
		<SectionHeader label={ title }>
			{ showButton && (
				<Button compact primary onClick={ onButtonClick } disabled={ disabled }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			) }
		</SectionHeader>
	);
};

SettingsSectionHeader.propTypes = {
	disabled: PropTypes.bool,
	isSaving: PropTypes.bool,
	onButtonClick: PropTypes.func,
	showButton: PropTypes.bool,
	title: PropTypes.string.isRequired,

	// from localize() HoC
	translate: PropTypes.func,
};

export default localize( SettingsSectionHeader );

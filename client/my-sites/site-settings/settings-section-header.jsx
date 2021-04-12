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

/**
 * Returns a header for setting sections.
 *
 * @param {object} props React component properties.
 * @param {React.Element?} props.children Optional React children.
 * @param {boolean?} props.disabled Sets the save button's disabled state.
 * @param {string?} props.id Sets the id for the SectionHeader component.
 * @param {boolean?} props.isSaving Sets the loading state for the save button.
 * @param {Function} props.onButtonClick Handler for clicking on the save button.
 * @param {boolean?} props.showButton Shows/hides the save button; defaults to false.
 * @param {string?} props.title Sets the label for the SectionHeader component.
 * @param {undefined} props.numberFormat Unknown.
 *
 * @returns {React.Element} returns a SectionHeader customized for setting pages.
 */
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

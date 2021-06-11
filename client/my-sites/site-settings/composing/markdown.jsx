/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import SupportInfo from 'calypso/components/support-info';
import { ToggleControl } from '@wordpress/components';

const Markdown = ( { fields, handleToggle, isRequestingSettings, isSavingSettings } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLegend>{ translate( 'Markdown' ) }</FormLegend>
			<SupportInfo
				text={ translate(
					'Use Markdown syntax to compose content with links, lists, and other styles. This setting enables Markdown in the Classic Editor as well as within a Classic Editor block.'
				) }
				link="https://wordpress.com/support/markdown-quick-reference/"
				privacyLink={ false }
			/>
			<ToggleControl
				checked={ !! fields.wpcom_publish_posts_with_markdown }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( 'wpcom_publish_posts_with_markdown' ) }
				label={ translate( 'Write posts or pages in plain-text Markdown syntax' ) }
			/>
		</FormFieldset>
	);
};

Markdown.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

Markdown.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default Markdown;

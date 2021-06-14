/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SupportInfo from 'calypso/components/support-info';
import { ToggleControl } from '@wordpress/components';
import { Card } from '@automattic/components';

const Markdown = ( { fields, handleToggle, isRequestingSettings, isSavingSettings } ) => {
	const translate = useTranslate();

	return (
		<Card className="composing__card site-settings__card">
			<SupportInfo
				text={ translate(
					'Use Markdown syntax to compose content with links, lists, and other styles. This setting enables Markdown in the Classic Editor as well as within a Classic Editor block.'
				) }
				link="https://wordpress.com/support/markdown-quick-reference/"
			/>
			<ToggleControl
				checked={ !! fields.wpcom_publish_posts_with_markdown }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( 'wpcom_publish_posts_with_markdown' ) }
				label={ translate( 'Write posts or pages in plain-text Markdown syntax.' ) }
			/>
		</Card>
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

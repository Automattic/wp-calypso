/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { ToggleControl } from '@wordpress/components';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import SupportInfo from 'calypso/components/support-info';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

const Markdown = ( { fields, handleToggle, isRequestingSettings, isSavingSettings } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );

	return (
		<Card className="composing__card site-settings__card">
			<SupportInfo
				text={ translate(
					'Use Markdown syntax to compose content with links, lists, and other styles. This setting enables Markdown in the Classic Editor as well as within a Classic Editor block.'
				) }
				link={
					isJetpack && ! isAtomic
						? 'https://jetpack.com/support/markdown/'
						: 'https://wordpress.com/support/markdown-quick-reference/'
				}
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

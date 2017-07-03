/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import GuidedTransfer from 'my-sites/guided-transfer';

const SiteSettingsGuidedTransfer = ( {
	hostSlug,
	translate,
} ) => (
	<Main className="settings-export__main site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<GuidedTransfer hostSlug={ hostSlug } />
	</Main>
);

SiteSettingsGuidedTransfer.propTypes = {
	hostSlug: PropTypes.string,
};

export default localize( SiteSettingsGuidedTransfer );

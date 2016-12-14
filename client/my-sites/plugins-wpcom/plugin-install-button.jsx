/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

function getPluginLink( pluginSlug, siteSlug ) {
	return `/plugins/${ pluginSlug }/${ siteSlug }/eligibility`;
}

export const WpcomPluginInstallButton = ( { translate, disabled, plugin, site } ) => {
	return <Button
		onClick={ undefined }
		primary={ true }
		type="submit"
		disabled={ disabled }
		href={ getPluginLink( plugin.slug, site.slug ) }
	>
		{ translate( 'Install' ) }
	</Button>;
};

export default localize( WpcomPluginInstallButton );

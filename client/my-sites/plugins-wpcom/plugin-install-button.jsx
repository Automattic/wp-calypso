/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export const WpcomPluginInstallButton = ( { translate, disabled, plugin, site } ) => {
	return <Button
		onClick={ undefined }
		primary={ true }
		type="submit"
		disabled={ disabled }
		href={ `/plugins/${ plugin.slug }/${ site.slug }/eligibility` }
	>
		{ translate( 'Install' ) }
	</Button>;
};

export default localize( WpcomPluginInstallButton );

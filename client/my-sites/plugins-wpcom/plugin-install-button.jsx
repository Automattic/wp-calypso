/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export const WpcomPluginInstallButton = ( { translate, disabled } ) => {
	return <Button
		onClick={ undefined }
		primary={ true }
		type="submit"
		disabled={ disabled }
	>
		{ translate( 'Install' ) }
	</Button>;
};

export default localize( WpcomPluginInstallButton );

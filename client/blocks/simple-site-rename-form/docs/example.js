/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { SimpleSiteRenameForm } from '../';

const SimpleSiteRenameFormExample = ( { siteId, siteSlug, translate } ) => {
	const currentDomainNameStub = {
		name: 'something-awesome.wordpress.com',
		type: 'WPCOM',
	};

	return (
		<SimpleSiteRenameForm translate={ translate } currentDomainName={ currentDomainNameStub } />
	);
};

const EnhancedComponent = localize( SimpleSiteRenameFormExample );

EnhancedComponent.displayName = 'SimpleSiteRenameForm';

export default EnhancedComponent;

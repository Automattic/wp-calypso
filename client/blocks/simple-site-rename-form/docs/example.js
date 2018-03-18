/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { delay, flow } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_RENAME_REQUEST_SUCCESS } from 'state/action-types';
import { SimpleSiteRenameForm } from '../';

const exampleSiteId = 73946047;

const SimpleSiteRenameFormExample = ( { siteId, siteSlug, translate, stubbedRequest } ) => {
	const currentDomainNameStub = {
		name: 'something-awesome.wordpress.com',
		type: 'WPCOM',
	};
	const currentDomainPrefix = 'something-awesome';
	const currentDomainSuffix = '.wordpress.com';

	return (
		<SimpleSiteRenameForm
			translate={ translate }
			requestSiteRename={ stubbedRequest }
			currentDomain={ currentDomainNameStub }
			currentDomainPrefix={ currentDomainPrefix }
			currentDomainSuffix={ currentDomainSuffix }
			selectedSiteId={ exampleSiteId }
		/>
	);
};

const EnhancedComponent = flow(
	localize,
	connect( null, dispatch => ( {
		// Fake a successful response
		stubbedRequest: () =>
			delay(
				() =>
					dispatch( {
						type: SITE_RENAME_REQUEST_SUCCESS,
						siteId: exampleSiteId,
					} ),
				200
			),
	} ) )
)( SimpleSiteRenameFormExample );

EnhancedComponent.displayName = 'SimpleSiteRenameForm';

export default EnhancedComponent;

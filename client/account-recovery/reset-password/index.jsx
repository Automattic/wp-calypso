/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PageViewTracker from 'client/lib/analytics/page-view-tracker';
import Main from 'client/components/main';
import DocumentHead from 'client/components/data/document-head';

export default localize( ( { className, translate, basePath, children } ) => (
	<Main className={ classnames( 'reset-password', className ) }>
		<PageViewTracker path={ basePath } title="Account Recovery > Reset Password" />
		<DocumentHead title={ translate( 'Reset Password ‹ Account Recovery' ) } />
		{ children }
	</Main>
) );

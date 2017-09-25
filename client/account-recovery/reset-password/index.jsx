/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';

export default localize( ( { className, translate, basePath, children } ) => (
	<Main className={ classnames( 'reset-password', className ) }>
		<PageViewTracker path={ basePath } title="Account Recovery > Reset Password" />
		<DocumentHead title={ translate( 'Reset Password ‹ Account Recovery' ) } />
		{ children }
	</Main>
) );

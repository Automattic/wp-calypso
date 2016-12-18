/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import ForgotUsernameForm from './forgot-username-form';

export default localize( ( { className, translate, basePath } ) => (
	<Main className={ classnames( 'forgot-username', className ) }>
		<PageViewTracker path={ basePath } title="Account Recovery > Forgot Username" />
		<DocumentHead title={ translate( 'Forgot Username ‹ Account Recovery' ) } />
		<ForgotUsernameForm />
	</Main>
) );

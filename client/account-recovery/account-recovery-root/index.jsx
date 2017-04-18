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
import LostPasswordForm from 'account-recovery/lost-password-form';

const getPageInfo = ( translate, slug ) => {
	const pageInfo = {
		lostPassword: {
			trackerTitle: 'Account Recovery > Lost Password',
			documentHeadTitle: translate( 'Lost Password ‹ Account Recovery' ),
		},
	};

	return pageInfo[ slug ];
};

const getForm = ( slug ) => {
	switch ( slug ) {
		case 'lostPassword':
			return <LostPasswordForm />;
	}

	return null;
};

const AccountRecoveryRoot = ( props ) => {
	const {
		className,
		translate,
		basePath,
		slug = 'lostPassword',
	} = props;

	const { trackerTitle, documentHeadTitle } = getPageInfo( translate, slug );

	return (
		<Main className={ classnames( 'account-recovery-form', className ) }>
			<PageViewTracker path={ basePath } title={ trackerTitle } />
			<DocumentHead title={ documentHeadTitle } />
			{ getForm( slug ) }
		</Main>
	);
};

export default localize( AccountRecoveryRoot );

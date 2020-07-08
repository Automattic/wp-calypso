/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice, { RewindFlowNoticeLevel } from './index';

interface Props {
	message: i18nCalypso.TranslateResult;
}

const RewindFlowCheckYourEmail: FunctionComponent< Props > = ( { message } ) => {
	const translate = useTranslate();

	return (
		<Notice
			gridicon="mail"
			type={ RewindFlowNoticeLevel.REMINDER }
			message={ message }
			title={ translate( 'Check your email' ) }
		/>
	);
};

export default RewindFlowCheckYourEmail;

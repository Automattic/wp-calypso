/**
 * External dependencies
 */
import React, { FC } from 'react';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

interface Props {
	content: TranslateResult;
}

const IncompatibleProductNotice: FC< Props > = ( { content } ) => {
	return <Notice status="is-error" text={ content } showDismiss={ false } />;
};

export default IncompatibleProductNotice;

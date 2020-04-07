/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { Button } from '@automattic/components';

const BackupsActivityTypeSelectorPlaceholder: FunctionComponent = () => {
	const translate = useTranslate();

	return <Button disabled>{ translate( 'Activity type' ) }</Button>;
};

export default BackupsActivityTypeSelectorPlaceholder;

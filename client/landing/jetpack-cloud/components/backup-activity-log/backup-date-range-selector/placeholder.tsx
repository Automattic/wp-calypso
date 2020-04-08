/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

const BackupsDateRangeSelectorPlaceholder: FunctionComponent = () => {
	const translate = useTranslate();

	return (
		<Button borderless className="backup-date-range-selector__placeholder">
			{ translate( 'Date range' ) }
		</Button>
	);
};

export default BackupsDateRangeSelectorPlaceholder;

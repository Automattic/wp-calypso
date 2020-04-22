/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useRef } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Popover from 'components/popover';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';

interface Props {
	group: string[];
	onGroupChange: ( newGroup: string[] ) => void;
	isVisible: boolean;
	onClick: () => void;
}

const ActivityTypeSelector: FunctionComponent< Props > = ( { isVisible, onClick } ) => {
	const translate = useTranslate();
	const buttonRef = useRef();
	return (
		<>
			<Button ref={ buttonRef } compact onClick={ onClick }>
				{ translate( 'Activity type' ) }
			</Button>
			<Popover context={ buttonRef.current } isVisible={ isVisible } position="bottom">
				{ 'hello' }
			</Popover>
		</>
	);
};

export default ActivityTypeSelector;

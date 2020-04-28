/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, RefObject } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Popover from 'components/popover';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	context: RefObject< Button >;
	isVisible: boolean;
	onClose: () => void;
}

const ActivityTypeSelector: FunctionComponent< Props > = ( { context, isVisible, onClose } ) => {
	const translate = useTranslate();

	return (
		<Popover
			context={ context.current }
			isVisible={ isVisible }
			onClose={ onClose }
			position="bottom"
		>
			<div>
				<Button primary compact>
					{ translate( 'Apply' ) }
				</Button>
			</div>
		</Popover>
	);
};

export default ActivityTypeSelector;

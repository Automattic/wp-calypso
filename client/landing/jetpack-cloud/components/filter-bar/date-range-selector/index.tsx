/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, RefObject, useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Popover from 'components/popover';
import DatePicker from 'components/date-picker';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	context: RefObject< Button >;
	isVisible: boolean;
	onClose: () => void;
}

const DATE_FORMAT = 'MM/DD/YYYY';

const DateRangeSelector: FunctionComponent< Props > = ( { context, isVisible, onClose } ) => {
	const translate = useTranslate();

	const [ firstDate, setFirstDate ] = useState( null );
	const [ secondDate, setSecondDate ] = useState( null );

	const renderInstructions = () => {
		return firstDate === null
			? translate( 'Please select the first date.' )
			: translate( 'Please select the second date' );
	};

	return (
		<Popover
			className="date-range-selector__popover"
			context={ context.current }
			isVisible={ isVisible }
			onClose={ onClose }
			position="bottom"
		>
			<div className="date-range-selector__controls">
				<h4>{ renderInstructions() }</h4>
				<Button compact>{ translate( 'Cancel' ) }</Button>
				<Button primary compact>
					{ translate( 'Apply' ) }
				</Button>
			</div>
			<DatePicker />
		</Popover>
	);
};

export default DateRangeSelector;

/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { noop } from 'lodash';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SharedProps from './shared-props';

interface Props {
	onApplyClick: () => void;
	onCancelClick: () => void;
	applyButtonText: string | null | undefined;
	cancelButtonText: string | null | undefined;
}

const DateRangeHeader: FunctionComponent< Props & SharedProps > = props => {
	const translate = useTranslate();

	return (
		<div className="date-range__popover-header">
			<Button className="date-range__cancel-btn" onClick={ props.onCancelClick } compact>
				{ props.cancelButtonText || translate( 'Cancel' ) }
			</Button>
			<Button className="date-range__apply-btn" onClick={ props.onApplyClick } primary compact>
				{ props.applyButtonText || translate( 'Apply' ) }
			</Button>
		</div>
	);
};

DateRangeHeader.defaultProps = {
	onApplyClick: noop,
	onCancelClick: noop,
};

export default DateRangeHeader;

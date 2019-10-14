/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SharedProps from './shared-props';

interface Props {
	onApplyClick: () => void;
	onCancelClick: () => void;
	applyButtonText: string;
	cancelButtonText: string;
}

export function DateRangeHeader( props: Props & SharedProps & LocalizeProps ) {
	return (
		<div className="date-range__popover-header">
			<Button className="date-range__cancel-btn" onClick={ props.onCancelClick } compact>
				{ props.cancelButtonText || props.translate( 'Cancel' ) }
			</Button>
			<Button className="date-range__apply-btn" onClick={ props.onApplyClick } primary compact>
				{ props.cancelButtonText || props.translate( 'Apply' ) }
			</Button>
		</div>
	);
}

DateRangeHeader.defaultProps = {
	onApplyClick: noop,
	onCancelClick: noop,
};

export default localize( DateRangeHeader );

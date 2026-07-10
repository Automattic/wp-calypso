import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
	onApplyClick: () => void;
	onCancelClick: () => void;
	applyButtonText: string | null | undefined;
	cancelButtonText: string | null | undefined;
	isApplyDisabled?: boolean;
}

const DateRangeFooter: FunctionComponent< Props > = ( {
	onCancelClick = noop,
	onApplyClick = noop,
	cancelButtonText,
	applyButtonText,
	isApplyDisabled = false,
} ) => {
	const translate = useTranslate();

	const cancelText = cancelButtonText || translate( 'Cancel' );
	const applyText = applyButtonText || translate( 'Apply' );

	return (
		<div className="date-range__popover-footer">
			<Button
				className="date-range__cancel-btn"
				onClick={ onCancelClick }
				variant="secondary"
				size="compact"
				aria-label={ cancelText }
			>
				{ cancelText }
			</Button>
			<Button
				className="date-range__apply-btn"
				onClick={ onApplyClick }
				variant="primary"
				size="compact"
				aria-label={ applyText }
				disabled={ isApplyDisabled }
			>
				{ applyText }
			</Button>
		</div>
	);
};

export default DateRangeFooter;

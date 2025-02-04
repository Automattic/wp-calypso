import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
	onApplyClick: () => void;
	onCancelClick: () => void;
	applyButtonText: string | null | undefined;
	cancelButtonText: string | null | undefined;
}

const DateRangeFooter: FunctionComponent< Props > = ( {
	onCancelClick = noop,
	onApplyClick = noop,
	cancelButtonText,
	applyButtonText,
} ) => {
	const translate = useTranslate();

	const cancelText = cancelButtonText || translate( 'Cancel' );
	const applyText = applyButtonText || translate( 'Apply' );

	return (
		<div className="date-range__popover-footer">
			<Button
				className="date-range__cancel-btn"
				onClick={ onCancelClick }
				compact
				aria-label={ cancelText }
			>
				{ cancelText }
			</Button>
			<Button
				className="date-range__apply-btn"
				onClick={ onApplyClick }
				primary
				compact
				aria-label={ applyText }
			>
				{ applyText }
			</Button>
		</div>
	);
};

export default DateRangeFooter;

import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

interface Props {
	customTitle?: string;
	startDate: Date | null;
	endDate: Date | null;
	resetDates: () => void;
}

const DateRangeHeader: FunctionComponent< Props > = ( {
	customTitle,
	startDate,
	endDate,
	resetDates,
} ) => {
	const translate = useTranslate();

	// Add this check at the beginning of the component
	if ( startDate === undefined || endDate === undefined || resetDates === undefined ) {
		return null; // or return a loading state
	}

	const renderDateHelp = () => {
		return (
			<div className="date-range__info" role="status" aria-live="polite">
				{ ! startDate &&
					! endDate &&
					translate( '{{icon/}} Please select the {{em}}first{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate &&
					! endDate &&
					translate( '{{icon/}} Please select the {{em}}last{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate && endDate && (
					<Button
						className="date-range__info-btn"
						borderless
						compact
						onClick={ resetDates }
						aria-label={ translate( 'Reset selected dates' ) }
					>
						{ translate( '{{icon/}} reset selected dates', {
							components: { icon: <Gridicon aria-hidden="true" icon="cross-small" /> },
						} ) }
					</Button>
				) }
			</div>
		);
	};

	return (
		<div className="date-range__popover-header">
			<div className="date-range__controls">
				{ customTitle ? (
					<div className="date-range__custom-title">{ customTitle }</div>
				) : (
					renderDateHelp()
				) }
			</div>
		</div>
	);
};

export default DateRangeHeader;

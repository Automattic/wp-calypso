import { Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';

// Add settings for holiday snow: ability to enable snow on the site until January 4th.
export default function HolidaySnow( { fields, handleToggle, isSaving, onSave, disabled } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// Only display the card between December 1st and January 4th.
	const today = moment();
	const currentYear = today.year();
	const startDate = moment( { year: currentYear, month: 11, date: 1 } ); // moment months are 0-indexed
	const endDate = moment( { year: currentYear, month: 0, date: 4 } ); // moment months are 0-indexed

	if ( today.isBefore( startDate, 'day' ) && today.isAfter( endDate, 'day' ) ) {
		return null;
	}

	const renderForm = () => {
		return (
			<>
				<ToggleControl
					disabled={ disabled }
					className="site-settings__holiday-snow-toggle"
					label={ translate( 'Enable snow' ) }
					checked={ fields.jetpack_holiday_snow_enabled }
					onChange={ handleToggle( 'jetpack_holiday_snow_enabled' ) }
				/>
			</>
		);
	};

	return (
		<PanelCard>
			<PanelCardHeading>{ translate( 'Holiday snow' ) }</PanelCardHeading>
			<PanelCardDescription>
				{ translate( 'Show falling snow on my site until January 4th.' ) }
			</PanelCardDescription>
			{ renderForm() }
			<Button busy={ isSaving } disabled={ disabled } onClick={ onSave }>
				{ translate( 'Save' ) }
			</Button>
		</PanelCard>
	);
}

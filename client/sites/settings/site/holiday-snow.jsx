import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { PanelCard, PanelCardHeading, PanelCardDescription } from 'calypso/components/panel';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useIsSiteSettingsUntangled } from '../hooks/use-is-site-settings-untangled';

// Add settings for holiday snow: ability to enable snow on the site until January 4th.
export default function HolidaySnow( { fields, handleToggle, isSaving, onSave, disabled } ) {
	const translate = useTranslate();
	const isUntangled = useIsSiteSettingsUntangled();
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
				{ ! isUntangled && (
					<FormSettingExplanation>
						{ translate( 'Show falling snow on my site until January 4th.' ) }
					</FormSettingExplanation>
				) }
			</>
		);
	};

	if ( ! isUntangled ) {
		return (
			<div className="site-settings__holiday-snow-container">
				<SettingsSectionHeader
					title={ translate( 'Holiday snow' ) }
					id="site-settings__holiday-snow-header"
					disabled={ disabled }
					isSaving={ isSaving }
					onButtonClick={ onSave }
					showButton
				/>
				<Card className="site-settings__holiday-snow-content">{ renderForm() }</Card>
			</div>
		);
	}

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

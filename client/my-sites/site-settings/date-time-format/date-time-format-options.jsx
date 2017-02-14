/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import SectionHeader from 'components/section-header';
import wrapSettingsForm from '../wrap-settings-form';

export class DateTimeFormatOptions extends Component {
	startOfWeekOption() {
		const {
			fields: { start_of_week },
			handleSelect,
			isRequestingSettings,
			translate,
		} = this.props;

		const daysOfWeek = [
			translate( 'Sunday' ),
			translate( 'Monday' ),
			translate( 'Tuesday' ),
			translate( 'Wednesday' ),
			translate( 'Thursday' ),
			translate( 'Friday' ),
			translate( 'Saturday' ),
		];

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Week Starts On' ) }
				</FormLabel>
				<FormSelect
					disabled={ isRequestingSettings }
					name="start_of_week"
					onChange={ handleSelect }
					value={ start_of_week || 0 }
				>
					{ daysOfWeek.map( ( day, index ) =>
						<option key={ index } value={ index }>
							{ day }
						</option>
					) }
				</FormSelect>
			</FormFieldset>
		);
	}

	render() {
		const {
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Privacy' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }

						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
							{ isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.startOfWeekOption() }
					</form>
				</Card>
			</div>
		);
	}
}

export default wrapSettingsForm( settings => {
	const defaultSettings = {
		date_format: '',
		time_format: '',
		start_of_week: 0,
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		date_format: settings.date_format,
		time_format: settings.time_format,
		start_of_week: settings.start_of_week,
	};

	return formSettings;
} )( localize( DateTimeFormatOptions ) );

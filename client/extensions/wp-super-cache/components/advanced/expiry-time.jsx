/**
 * External dependencies
 */

import React from 'react';
import { pick } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const ExpiryTime = ( {
	fields: {
		cache_gc_email_me,
		cache_max_time,
		cache_next_gc,
		cache_schedule_interval,
		cache_schedule_type,
		cache_scheduled_time,
		cache_time_interval,
		preload_on,
	},
	handleAutosavingToggle,
	handleChange,
	handleRadio,
	handleSelect,
	handleSubmitForm,
	isReadOnly,
	isRequesting,
	isSaving,
	translate,
} ) => {
	const isDisabled = isRequesting || isSaving || isReadOnly;

	const renderCacheTimeout = () => {
		return (
			<FormFieldset>
				<FormLabel htmlFor="cache_max_time">{ translate( 'Cache Timeout' ) }</FormLabel>

				<FormTextInput
					className="wp-super-cache__cache-timeout"
					disabled={ isDisabled }
					min="0"
					onChange={ handleChange( 'cache_max_time' ) }
					step="1"
					type="number"
					value={ cache_max_time || 0 }
				/>
				{ translate( 'seconds' ) }
				<FormSettingExplanation>
					{ translate(
						'How long should cached pages remain fresh? Set to 0 to disable garbage collection. ' +
							'A good starting point is 3600 seconds.'
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	};

	const renderScheduler = () => {
		return (
			<FormFieldset className="wp-super-cache__scheduler">
				<FormLabel>{ translate( 'Scheduler' ) }</FormLabel>

				<FormLabel>
					<FormRadio
						checked={ 'interval' === cache_schedule_type }
						disabled={ isDisabled }
						name="cache_schedule_type"
						onChange={ handleRadio }
						value="interval"
					/>
					<span>
						{ translate( 'Timer' ) }
						<FormTextInput
							disabled={ isDisabled || 'interval' !== cache_schedule_type }
							min="1"
							onChange={ handleChange( 'cache_time_interval' ) }
							step="1"
							type="number"
							value={ cache_time_interval || '' }
						/>
						{ translate( 'seconds' ) }
					</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate( 'Check for stale cached files every interval seconds.' ) }
				</FormSettingExplanation>

				<FormLabel className="wp-super-cache__clock">
					<FormRadio
						checked={ 'time' === cache_schedule_type }
						disabled={ isDisabled }
						name="cache_schedule_type"
						onChange={ handleRadio }
						value="time"
					/>
					<span>
						{ translate( 'Clock' ) }
						<FormTextInput
							disabled={ isDisabled || 'time' !== cache_schedule_type }
							onChange={ handleChange( 'cache_scheduled_time' ) }
							value={ cache_scheduled_time || '' }
						/>
						{ translate( 'HH:MM' ) }
					</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate(
						'Check for stale cached files at this time (UTC) or starting at this time ' +
							'every interval below.'
					) }
				</FormSettingExplanation>

				<div className="wp-super-cache__interval">
					<FormLabel htmlFor="cache_schedule_interval">{ translate( 'Interval' ) }</FormLabel>

					<FormSelect
						disabled={ isDisabled || 'time' !== cache_schedule_type }
						id="cache_schedule_interval"
						name="cache_schedule_interval"
						onChange={ handleSelect }
						value={ cache_schedule_interval || 'five_minutes_interval' }
					>
						<option value="five_minutes_interval">
							{ translate( 'Once every five minutes' ) }
						</option>
						<option value="jetpack_sync_interval">{ translate( 'Every 5 minutes' ) }</option>
						<option value="minutes_10">{ translate( 'Every 10 minutes' ) }</option>
						<option value="minutes_30">{ translate( 'Every 30 minutes' ) }</option>
						<option value="hourly">{ translate( 'Once Hourly' ) }</option>
						<option value="twicedaily">{ translate( 'Twice Daily' ) }</option>
						<option value="daily">{ translate( 'Once Daily' ) }</option>
					</FormSelect>
				</div>
			</FormFieldset>
		);
	};

	const renderNotificationEmails = () => {
		return (
			<FormFieldset>
				<FormLabel htmlFor="cache_gc_email_me">{ translate( 'Notification Emails' ) }</FormLabel>

				<FormToggle
					checked={ !! cache_gc_email_me }
					disabled={ isDisabled }
					id="cache_gc_email_me"
					onChange={ handleAutosavingToggle( 'cache_gc_email_me' ) }
				>
					<span>{ translate( 'Email me when the garbage collection runs.' ) }</span>
				</FormToggle>
			</FormFieldset>
		);
	};

	const formatUnixTimestamp = ( timestamp ) => {
		if ( ! timestamp ) {
			return;
		}

		return moment.unix( timestamp ).utc().format( 'YYYY-MM-DD H:mm:ss' );
	};

	return (
		<div>
			<SectionHeader label={ translate( 'Expiry Time & Garbage Collection' ) }>
				<Button compact primary disabled={ isDisabled } onClick={ handleSubmitForm }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<p>
					{ translate( 'UTC time is ' ) + moment().utc().format( 'YYYY-MM-DD H:mm:ss' ) }
					<br />
					{ translate( 'Local time is ' ) + moment().format( 'YYYY-MM-DD H:mm:ss' ) }
				</p>
				{ cache_next_gc && (
					<p>
						{ translate( 'Next scheduled garbage collection will be at ' ) +
							`${ formatUnixTimestamp( cache_next_gc ) } UTC` }
					</p>
				) }
				{ preload_on && (
					<p>
						{ translate(
							'Warning! {{strong}}PRELOAD MODE{{/strong}} activated. Supercache files will not be ' +
								'deleted regardless of age.',
							{
								components: { strong: <strong /> },
							}
						) }
					</p>
				) }
				<form>
					{ renderCacheTimeout() }
					{ renderScheduler() }
					{ renderNotificationEmails() }
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = ( settings ) => {
	return pick( settings, [
		'cache_gc_email_me',
		'cache_max_time',
		'cache_next_gc',
		'cache_schedule_interval',
		'cache_schedule_type',
		'cache_scheduled_time',
		'cache_time_interval',
		'preload_on',
	] );
};

export default WrapSettingsForm( getFormSettings )( ExpiryTime );

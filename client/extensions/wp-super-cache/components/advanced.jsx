/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { partial } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import AcceptedFilenames from './accepted-filenames';
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import MultiCheckbox from 'components/forms/multi-checkbox';
import SectionHeader from 'components/section-header';

class Advanced extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		cacheLocation: '/wordpress/wp-content/cache/',
		cacheTimeout: '3600',
		cachingEnabled: '0',
		cachingType: '0',
		notificationEmails: '',
		rejectedUri: 'wp-.*\.php\nindex\.php',
		scheduler: {
			clock: '',
			interval: 'five_minutes_interval',
			timer: '',
			type: 'interval',
		},
		values: {},
	};

	handleMultiCheckboxChange = ( option, selectedValues ) => {
		this.setState( { values: { ...this.state.values, [ option ]: selectedValues.value } } );
	}

	// TODO: Separate components per section?
	handleCachingEnabledChange = event => this.setState( { cachingEnabled: event.currentTarget.value } );

	handleCachingTypeChange = event => this.setState( { cachingType: event.currentTarget.value } );

	handleCacheLocationChange = event => this.setState( { cacheLocation: event.target.value } );

	handleCacheTimeoutChange = event => this.setState( { cacheTimeout: event.target.value } );

	handleSchedulerTypeChange = event => this.setState( { scheduler: { ...this.state.scheduler, type: event.target.value } } );

	handleSchedulerTimerChange = event => this.setState( { scheduler: { ...this.state.scheduler, timer: event.target.value } } );

	handleSchedulerClockChange = event => this.setState( { scheduler: { ...this.state.scheduler, clock: event.target.value } } );

	handleSchedulerIntervalChange = event => this.setState( { scheduler: { ...this.state.scheduler, interval: event.target.value } } );

	handleNotificationEmailsChange = () => this.setState( { notificationEmails: ! this.state.notificationEmails } );

	handleRejectedUriChange = event => this.setState( { rejectedUri: event.target.value } );

	getMiscellaneousOptions = () => {
		const { translate } = this.props;

		return [
			{ value: 'compression',
				label: translate( 'Compress pages so they’re served more quickly to visitors. ' +
					'{{em}}(Recommended{{/em}})',
					{
						components: { em: <em /> }
					}
				)
			},
			{ value: 'knownUsers',
				label: translate( 'Don’t cache pages for known users. {{em}}(Recommended){{/em}}',
					{
						components: { em: <em /> }
					}
				)
			},
			{ value: 'rebuild',
				label: translate( 'Cache rebuild. Serve a supercache file to anonymous users while a new ' +
					'file is being generated. {{em}}(Recommended){{/em}}',
					{
						components: { em: <em /> }
					}
				)
			},
			{ value: 'browserCaching',
				label: translate( '304 Not Modified browser caching. Indicate when a page has not been ' +
					'modified since it was last requested. {{em}}(Recommended){{/em}}',
					{
						components: { em: <em /> }
					}
				)
			},
			{ value: 'getParams',
				label: translate( 'Don’t cache pages with GET parameters. (?x=y at the end of a url)' )
			},
			{ value: 'anonymous',
				label: translate( 'Make known users anonymous so they’re served supercached static files.' )
			},
			{ value: 'footer',
				label: translate( 'Proudly tell the world your server is {{fry}}Stephen Fry proof{{/fry}}! ' +
					'(places a message in your blog’s footer)',
					{
						components: {
							fry: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://twitter.com/#!/HibbsLupusTrust/statuses/136429993059291136"
								/>
							),
						}
					}
				)
			},
		];
	}

	getAdvancedOptions = () => {
		const { translate } = this.props;

		return [
			{ value: 'dynamic',
				label: translate( 'Enable dynamic caching. Requires PHP or legacy caching. (See ' +
					'{{faq}}FAQ{{/faq}} or wp-super-cache/plugins/dynamic-cache-test.php for example code.)',
					{
						components: {
							faq: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="http://wordpress.org/plugins/wp-super-cache/faq/"
								/>
							),
						}
					}
				)
			},
			{ value: 'mobile',
				label: translate( 'Mobile device support. (External plugin or theme required. See the ' +
					'{{faq}}FAQ{{/faq}} for further details.)',
					{
						components: {
							faq: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="http://wordpress.org/plugins/wp-super-cache/faq/"
								/>
							),
						}
					}
				)
			},
			{ value: 'charset',
				label: translate( 'Remove UTF8/blog charset support from .htaccess file. Only necessary ' +
					'if you see odd characters or punctuation looks incorrect. Requires rewrite rules update.' )
			},
			{ value: 'publish',
				label: translate( 'Clear all cache files when a post or page is published or updated.' )
			},
			{ value: 'homepage',
				label: translate( 'Extra homepage checks. (Very occasionally stops homepage caching) {{em}}(Recommended){{/em}}',
					{
						components: { em: <em /> }
					}
				)
			},
			{ value: 'comments',
				label: translate( 'Only refresh current page when comments made.' )
			},
			{ value: 'newest',
				label: translate( 'List the newest cached pages on this page.' )
			},
			{ value: 'fileLocking',
				label: translate( 'Coarse file locking. You do not need this as it will slow down your website.' )
			},
			{ value: 'lateInit',
				label: translate( 'Late init. Display cached files after WordPress has loaded. Most useful in legacy mode.' )
			},
		];
	}

	// TODO: Function to generate multiple radio buttons?
	renderCaching() {
		const { translate } = this.props;
		const { cachingEnabled, cachingType } = this.state;

		return (
			<Card>
				<form>
					<FormFieldset>
						<FormLabel>
							<FormRadio
								checked={ 'all' === cachingEnabled }
								onChange={ this.handleCachingEnabledChange }
								value="all" />
							<span>
								{ translate( 'Caching On {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ '0' === cachingEnabled }
								onChange={ this.handleCachingEnabledChange }
								value="0" />
							<span>{ translate( 'Caching Off' ) }</span>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							<FormRadio
								checked={ '1' === cachingType }
								onChange={ this.handleCachingTypeChange }
								value="1" />
							<span>
								{ translate( 'Use mod_rewrite to serve cache files.' ) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ '2' === cachingType }
								onChange={ this.handleCachingTypeChange }
								value="2" />
							<span>
								{ translate(
									'Use PHP to serve cache files. {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ '0' === cachingType }
								onChange={ this.handleCachingTypeChange }
								value="0" />
							<span>
								{ translate( 'Legacy page caching.' ) }
							</span>
						</FormLabel>
						<FormSettingExplanation>
							{
								translate(
									'Mod_rewrite is fastest, PHP is almost as fast and easier to get working, ' +
									'while legacy caching is slower again, but more flexible and also easy to get ' +
									'working. New users should use PHP caching.'
								)
							}
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		);
	}

	renderMiscellaneous() {
		const { values } = this.state;
		const handleMiscellaneous = partial( this.handleMultiCheckboxChange, 'miscellaneous' );

		return (
			<Card>
				<form>
					<FormFieldset>
						<MultiCheckbox
							checked={ values.miscellaneous }
							defaultChecked={ [ 'rebuild' ] }
							name="miscellaneous"
							onChange={ handleMiscellaneous }
							options={ this.getMiscellaneousOptions() } />
					</FormFieldset>
				</form>
			</Card>
		);
	}

	renderAdvanced() {
		const { translate } = this.props;
		const { values } = this.state;
		const handleAdvanced = partial( this.handleMultiCheckboxChange, 'advanced' );

		return (
			<Card>
				<form>
					<FormFieldset>
						<MultiCheckbox
							checked={ values.advanced }
							defaultChecked={ [ 'homepage' ] }
							name="advanced"
							options={ this.getAdvancedOptions() }
							onChange={ handleAdvanced } />
					</FormFieldset>
					<p>
						{ translate(
							'{{strong}}DO NOT CACHE PAGE{{/strong}} secret key:',
							{
								components: { strong: <strong /> }
							}
						) }
					</p>
				</form>
			</Card>
		);
	}

	renderCacheLocation() {
		const { translate } = this.props;
		const { cacheLocation } = this.state;

		return (
			<Card>
				<form>
					<FormFieldset>
						<FormTextInput
							onChange={ this.handleCacheLocationChange }
							value={ cacheLocation } />
						<FormSettingExplanation>
							{ translate(
								'Change the location of your cache files. The default is WP_CONTENT_DIR . ' +
								'/cache/ which translates to {{cacheLocation/}}',
								{
									components: {
										cacheLocation: <span>{ cacheLocation }</span>,
									}
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		);
	}

	renderCacheTimeout() {
		const { translate } = this.props;
		const { cacheTimeout } = this.state;
		const style = {
			width: '100px',
			marginRight: '10px',
		};

		return (
			<FormFieldset>
				<FormLabel htmlFor="wp_max_time">
					{ translate( 'Cache Timeout' ) }
				</FormLabel>

				<FormTextInput
					id="wp_max_time"
					onChange={ this.handleCacheTimeoutChange }
					style={ style }
					type="text"
					value={ cacheTimeout } />
				{ translate( 'seconds' ) }
				<FormSettingExplanation>
					{
						translate(
							'How long should cached pages remain fresh? Set to 0 to disable garbage collection. ' +
							'A good starting point is 3600 seconds.'
						)
					}
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	renderScheduler() {
		const { translate } = this.props;
		const { clock, timer, type } = this.state.scheduler;
		const style = {
			width: '100px',
			marginLeft: '10px',
			marginRight: '10px',
		};

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Scheduler' ) }
				</FormLabel>

				<FormLabel>
					<FormRadio
						checked={ 'interval' === type }
						onChange={ this.handleSchedulerTypeChange }
						style= { { marginTop: '12px' } }
						value="interval" />
					<span>
						{ translate( 'Timer' ) }
						<FormTextInput
							disabled={ 'interval' !== type }
							onChange={ this.handleSchedulerTimerChange }
							style={ style }
							type="text"
							value={ timer } />
						{ translate( 'seconds' ) }
					</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate( 'Check for stale cached files every interval seconds.' ) }
				</FormSettingExplanation>

				<FormLabel>
					<FormRadio
						checked={ 'time' === type }
						onChange={ this.handleSchedulerTypeChange }
						style= { { marginTop: '12px' } }
						value="time" />
					<span>
						{ translate( 'Clock' ) }
						<FormTextInput
							disabled={ 'time' !== type }
							onChange={ this.handleSchedulerClockChange }
							style={ style }
							type="text"
							value={ clock } />
						{ translate( 'HH:MM' ) }
					</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate( 'Check for stale cached files at this time (UTC) or starting at this time ' +
						'every interval below.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	renderInterval() {
		const { translate } = this.props;
		const { interval } = this.state.scheduler;

		return (
			<FormFieldset>
				<FormLabel htmlFor="cache_scheduled_select">
					{ translate( 'Interval' ) }
				</FormLabel>

				<FormSelect
					id="cache_scheduled_select"
					onChange={ this.handleSchedulerIntervalChange }
					value={ interval }>
					<option value="five_minutes_interval">{ translate( 'Once every five minutes' ) }</option>
					<option value="jetpack_sync_interval">{ translate( 'Every 5 minutes' ) }</option>
					<option value="minutes_10">{ translate( 'Every 10 minutes' ) }</option>
					<option value="minutes_30">{ translate( 'Every 30 minutes' ) }</option>
					<option value="hourly">{ translate( 'Once Hourly' ) }</option>
					<option value="twicedaily">{ translate( 'Twice Daily' ) }</option>
					<option value="daily">{ translate( 'Once Daily' ) }</option>
				</FormSelect>
			</FormFieldset>
		);
	}

	renderNotificationEmails() {
		const { translate } = this.props;
		const { notificationEmails } = this.state.scheduler;

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Notification Emails' ) }
				</FormLabel>

				<FormLabel>
					<FormCheckbox checked={ notificationEmails } onChange={ this.handleNotificationEmailsChange } />
					<span>{ translate( 'Email me when the garbage collection runs.' ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	render() {
		const { translate } = this.props;
		const { values } = this.state;
		const handleAcceptedFilenames = partial( this.handleMultiCheckboxChange, 'acceptedFilenames' );

		return (
			<div>
				<SectionHeader label={ translate( 'Caching' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				{ this.renderCaching() }

				<SectionHeader label={ translate( 'Miscellaneous' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				{ this.renderMiscellaneous() }

				<SectionHeader label={ translate( 'Advanced' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				{ this.renderAdvanced() }

				<SectionHeader label={ translate( 'Cache Location' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				{ this.renderCacheLocation() }

				<SectionHeader label={ translate( 'Expiry Time & Garbage Collection' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card>
					<p>
						{ translate( 'UTC time is ' ) + moment().utc().format( 'YYYY-MM-DD h:mm:ss' ) }
					</p>
					<form>
						{ this.renderCacheTimeout() }
						{ this.renderScheduler() }
						{ this.renderInterval() }
						{ this.renderNotificationEmails() }
					</form>
				</Card>

				<AcceptedFilenames
					checked={ values.acceptedFilenames }
					onChange={ handleAcceptedFilenames } />
			</div>
		);
	}
}

export default localize( Advanced );

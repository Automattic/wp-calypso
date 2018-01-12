/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import LanguagePicker from 'components/language-picker';
import SectionHeader from 'components/section-header';
import config from 'config';
import notices from 'notices';
import FormInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Timezone from 'components/timezone';
import SiteIconSetting from './site-icon-setting';
import Banner from 'components/banner';
import { isBusiness } from 'lib/products-values';
import { FEATURE_NO_BRANDING, PLAN_BUSINESS } from 'lib/plans/constants';
import QuerySiteSettings from 'components/data/query-site-settings';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { preventWidows } from 'lib/formatting';

class SiteSettingsFormGeneral extends Component {
	componentWillMount() {
		this._showWarning( this.props.site );
	}

	onTimezoneSelect = timezone => {
		this.props.updateFields( {
			timezone_string: timezone,
		} );
	};

	siteOptions() {
		const {
			translate,
			isRequestingSettings,
			fields,
			eventTracker,
			onChangeField,
			uniqueEventTracker,
		} = this.props;

		return (
			<div className="site-settings__site-options">
				<div className="site-settings__site-title-tagline">
					<FormFieldset>
						<FormLabel htmlFor="blogname">{ translate( 'Site Title' ) }</FormLabel>
						<FormInput
							name="blogname"
							id="blogname"
							data-tip-target="site-title-input"
							type="text"
							value={ fields.blogname || '' }
							onChange={ onChangeField( 'blogname' ) }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Title Field' ) }
							onKeyPress={ uniqueEventTracker( 'Typed in Site Title Field' ) }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="blogdescription">{ translate( 'Site Tagline' ) }</FormLabel>
						<FormInput
							name="blogdescription"
							type="text"
							id="blogdescription"
							data-tip-target="site-tagline-input"
							value={ fields.blogdescription || '' }
							onChange={ onChangeField( 'blogdescription' ) }
							disabled={ isRequestingSettings }
							onClick={ eventTracker( 'Clicked Site Tagline Field' ) }
							onKeyPress={ uniqueEventTracker( 'Typed in Site Tagline Field' ) }
						/>
						<FormSettingExplanation>
							{ translate( 'In a few words, explain what this site is about.' ) }
						</FormSettingExplanation>
					</FormFieldset>
				</div>
				<SiteIconSetting />
			</div>
		);
	}

	blogAddress() {
		const { site, siteIsJetpack, siteSlug, translate } = this.props;
		let customAddress = '',
			addressDescription = '';

		if ( ! site || siteIsJetpack ) {
			return null;
		}

		if ( config.isEnabled( 'upgrades/domain-search' ) ) {
			customAddress = (
				<Button href={ '/domains/add/' + siteSlug } onClick={ this.trackUpgradeClick }>
					<Gridicon icon="plus" />{' '}
					{ translate( 'Add a Custom Address', { context: 'Site address, domain' } ) }
				</Button>
			);

			addressDescription = (
				<FormSettingExplanation>
					{ translate(
						'Buy a {{domainSearchLink}}custom domain{{/domainSearchLink}}, ' +
							'{{mapDomainLink}}map{{/mapDomainLink}} a domain you already own, ' +
							'or {{redirectLink}}redirect{{/redirectLink}} this site.',
						{
							components: {
								domainSearchLink: (
									<a href={ '/domains/add/' + siteSlug } onClick={ this.trackUpgradeClick } />
								),
								mapDomainLink: (
									<a
										href={ '/domains/add/mapping/' + siteSlug }
										onClick={ this.trackUpgradeClick }
									/>
								),
								redirectLink: (
									<a
										href={ '/domains/add/site-redirect/' + siteSlug }
										onClick={ this.trackUpgradeClick }
									/>
								),
							},
						}
					) }
				</FormSettingExplanation>
			);
		}

		return (
			<FormFieldset className="site-settings__has-divider">
				<FormLabel htmlFor="blogaddress">{ translate( 'Site Address' ) }</FormLabel>
				<div className="site-settings__blogaddress-settings">
					<FormInput
						name="blogaddress"
						type="text"
						id="blogaddress"
						value={ site.domain }
						disabled="disabled"
					/>
					{ customAddress }
				</div>
				{ addressDescription }
			</FormFieldset>
		);
	}

	trackUpgradeClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'settings_site_address',
		} );
	};

	languageOptions() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			onChangeField,
			siteIsJetpack,
			translate,
		} = this.props;

		return (
			<FormFieldset
				className={ siteIsJetpack && classNames( 'site-settings__has-divider', 'is-top-only' ) }
			>
				<FormLabel htmlFor="lang_id">{ translate( 'Language' ) }</FormLabel>
				<LanguagePicker
					languages={ config( 'languages' ) }
					valueKey={ siteIsJetpack ? 'wpLocale' : 'value' }
					value={ fields.lang_id }
					onChange={ onChangeField( 'lang_id' ) }
					disabled={ isRequestingSettings }
					onClick={ eventTracker( 'Clicked Language Field' ) }
				/>
				<FormSettingExplanation>
					{ translate( 'Language this blog is primarily written in.' ) }&nbsp;
					<a href={ config.isEnabled( 'me/account' ) ? '/me/account' : '/settings/account/' }>
						{ translate( "You can also modify your interface's language in your profile." ) }
					</a>
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	visibilityOptions() {
		const {
			fields,
			handleRadio,
			isRequestingSettings,
			eventTracker,
			siteIsJetpack,
			translate,
		} = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormRadio
						name="blog_public"
						value="1"
						checked={ 1 === parseInt( fields.blog_public, 10 ) }
						onChange={ handleRadio }
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ translate( 'Public' ) }</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate(
						'Your site is visible to everyone, and it may be indexed by search engines.'
					) }
				</FormSettingExplanation>

				<FormLabel>
					<FormRadio
						name="blog_public"
						value="0"
						checked={ 0 === parseInt( fields.blog_public, 10 ) }
						onChange={ handleRadio }
						disabled={ isRequestingSettings }
						onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
					/>
					<span>{ translate( 'Hidden' ) }</span>
				</FormLabel>
				<FormSettingExplanation isIndented>
					{ translate(
						'Your site is visible to everyone, but we ask search engines to not index your site.'
					) }
				</FormSettingExplanation>

				{ ! siteIsJetpack && (
					<div>
						<FormLabel>
							<FormRadio
								name="blog_public"
								value="-1"
								checked={ -1 === parseInt( fields.blog_public, 10 ) }
								onChange={ handleRadio }
								disabled={ isRequestingSettings }
								onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
							/>
							<span>{ translate( 'Private' ) }</span>
						</FormLabel>
						<FormSettingExplanation isIndented>
							{ translate( 'Your site is only visible to you and users you approve.' ) }
						</FormSettingExplanation>
					</div>
				) }
			</FormFieldset>
		);
	}

	holidaySnowOption() {
		// Note that years and months below are zero indexed
		const {
				fields,
				handleToggle,
				isRequestingSettings,
				moment,
				supportsHolidaySnowOption,
				translate,
			} = this.props,
			today = moment(),
			startDate = moment( { year: today.year(), month: 11, day: 1 } ),
			endDate = moment( { year: today.year(), month: 0, day: 4 } );

		if ( ! supportsHolidaySnowOption ) {
			return null;
		}

		if ( today.isBefore( startDate, 'day' ) && today.isAfter( endDate, 'day' ) ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Holiday Snow' ) }</FormLegend>
				<ul>
					<li>
						<CompactFormToggle
							checked={ !! fields.holidaysnow }
							disabled={ isRequestingSettings }
							onChange={ handleToggle( 'holidaysnow' ) }
						>
							{ translate( 'Show falling snow on my blog until January 4th.' ) }
						</CompactFormToggle>
					</li>
				</ul>
			</FormFieldset>
		);
	}

	netNeutralityOption() {
		const {
			fields,
			isRequestingSettings,
			translate,
			handleToggle,
			moment,
			handleSubmitForm,
			isSavingSettings,
		} = this.props;

		const today = moment();
		// Days and years are 1-indexed, and other things are 0-indexed; i.e. December is month 11.
		const lastDay = moment( { year: 2017, month: 11, day: 31 } );

		if ( today.isAfter( lastDay, 'day' ) ) {
			return null;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Net Neutrality' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }
						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card>
					<FormFieldset>
						<CompactFormToggle
							checked={ !! fields.net_neutrality }
							disabled={ isRequestingSettings }
							onChange={ handleToggle( 'net_neutrality' ) }
						>
							{ translate(
								'The FCC wants to repeal Net Neutrality. Without Net Neutrality, ' +
									'big cable and telecom companies can divide the internet into fast ' +
									'and slow lanes. What would the Internet look like without net neutrality? ' +
									'Find out by enabling this banner on your site: it shows your support ' +
									'for real net neutrality rules by displaying a message on the bottom ' +
									'of your site and "slowing down" some of your posts. ' +
									'{{netNeutralityLink}}Learn more about Net Neutrality{{/netNeutralityLink}}',
								{
									components: {
										netNeutralityLink: (
											<a
												target="_blank"
												rel="noopener noreferrer"
												href={
													'https://en.blog.wordpress.com/2017/07/11/join-us-in-the-fight-for-net-neutrality/'
												}
											/>
										),
									},
								}
							) }
						</CompactFormToggle>
					</FormFieldset>
				</Card>
			</div>
		);
	}

	Timezone() {
		const { fields, isRequestingSettings, translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="blogtimezone">{ translate( 'Site Timezone' ) }</FormLabel>

				<Timezone
					selectedZone={ fields.timezone_string }
					disabled={ isRequestingSettings }
					onSelect={ this.onTimezoneSelect }
				/>

				<FormSettingExplanation>
					{ translate( 'Choose a city in your timezone.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	render() {
		const {
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			site,
			siteIsJetpack,
			siteSlug,
			translate,
		} = this.props;
		if ( siteIsJetpack && ! site.hasMinimumJetpackVersion ) {
			return null;
		}

		const classes = classNames( 'site-settings__general-settings', {
			'is-loading': isRequestingSettings,
		} );

		return (
			<div className={ classNames( classes ) }>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }

				{ ! siteIsJetpack && this.netNeutralityOption() }

				<SectionHeader label={ translate( 'Site Profile' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }
						data-tip-target="settings-site-profile-save"
						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.siteOptions() }
						{ this.blogAddress() }
						{ this.languageOptions() }
						{ this.Timezone() }
						{ this.holidaySnowOption() }
					</form>
				</Card>

				<SectionHeader label={ translate( 'Privacy' ) }>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }
						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card>
					<form>{ this.visibilityOptions() }</form>
				</Card>

				{ ! siteIsJetpack && (
					<div className="site-settings__footer-credit-container">
						<SectionHeader label={ translate( 'Footer Credit' ) } />
						<CompactCard className="site-settings__footer-credit-explanation">
							<p>
								{ preventWidows(
									translate(
										'You can customize your website by changing the footer credit in customizer.'
									),
									2
								) }
							</p>
							<div>
								<Button
									className="site-settings__footer-credit-change"
									href={ '/customize/identity/' + siteSlug }
								>
									{ translate( 'Change footer credit' ) }
								</Button>
							</div>
						</CompactCard>
						{ site &&
							! isBusiness( site.plan ) && (
								<Banner
									feature={ FEATURE_NO_BRANDING }
									plan={ PLAN_BUSINESS }
									title={ translate(
										'Remove the footer credit entirely with WordPress.com Business'
									) }
									description={ translate(
										'Upgrade to remove the footer credit, add Google Analytics and more'
									) }
								/>
							) }
					</div>
				) }
			</div>
		);
	}

	_showWarning( site ) {
		const { siteIsJetpack, translate } = this.props;
		if ( ! site || ! site.options ) {
			return;
		}
		if ( siteIsJetpack && ! site.hasMinimumJetpackVersion ) {
			notices.warning(
				translate( 'Jetpack %(version)s is required to manage Settings', {
					args: { version: config( 'jetpack_min_version' ) },
				} ),
				{
					button: translate( 'Update now' ),
					href: site.options.admin_url + 'plugins.php?plugin_status=upgrade',
				}
			);
		}
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );

		return {
			siteIsJetpack,
			siteSlug: getSelectedSiteSlug( state ),
			supportsHolidaySnowOption: ! siteIsJetpack || isJetpackMinimumVersion( state, siteId, '4.0' ),
		};
	},
	null,
	null,
	{ pure: false }
);

const getFormSettings = settings => {
	const defaultSettings = {
		blogname: '',
		blogdescription: '',
		lang_id: '',
		timezone_string: '',
		blog_public: '',
		admin_url: '',
		holidaysnow: false,
		net_neutrality: false,
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		blogname: settings.blogname,
		blogdescription: settings.blogdescription,

		lang_id: settings.lang_id,
		blog_public: settings.blog_public,
		timezone_string: settings.timezone_string,

		holidaysnow: !! settings.holidaysnow,

		net_neutrality: settings.net_neutrality,
	};

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if ( ! settings.timezone_string && typeof gmt_offset === 'string' && gmt_offset.length ) {
		formSettings.timezone_string = 'UTC' + ( /\-/.test( gmt_offset ) ? '' : '+' ) + gmt_offset;
	}

	return formSettings;
};

export default flowRight( connectComponent, wrapSettingsForm( getFormSettings ) )(
	SiteSettingsFormGeneral
);

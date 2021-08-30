import config from '@automattic/calypso-config';
import { flowRight, get, pick } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FeedSettings from 'calypso/my-sites/site-settings/feed-settings';
import PodcastingLink from 'calypso/my-sites/site-settings/podcasting-details/link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { requestPostTypes } from 'calypso/state/post-types/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Composing from './composing';
import CustomContentTypes from './custom-content-types';
import Masterbar from './masterbar';
import MediaSettingsWriting from './media-settings-writing';
import MediaSettingsWatermark from './watermark';
import PressThis from './press-this';
import PublishingTools from './publishing-tools';
import ThemeEnhancements from './theme-enhancements';
import Widgets from './widgets';
import wrapSettingsForm from './wrap-settings-form';

class SiteSettingsFormWriting extends Component {
	isMobile() {
		return /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Silk/.test( navigator.userAgent );
	}

	render() {
		const {
			eventTracker,
			uniqueEventTracker,
			fields,
			handleSelect,
			handleToggle,
			handleAutosavingToggle,
			handleAutosavingRadio,
			handleSubmitForm,
			isPodcastingSupported,
			isMasterbarSectionVisible,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			setFieldValue,
			siteId,
			siteIsJetpack,
			translate,
			siteIsAutomatedTransfer,
			updateFields,
		} = this.props;

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__writing-settings"
			>
				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Composing' ) }
				/>
				<Composing
					handleSelect={ handleSelect }
					handleToggle={ handleToggle }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
					eventTracker={ eventTracker }
					uniqueEventTracker={ uniqueEventTracker }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					updateFields={ updateFields }
				/>

				{ siteIsJetpack && ! siteIsAutomatedTransfer && (
					<div>
						<SettingsSectionHeader
							disabled={ isRequestingSettings || isSavingSettings }
							isSaving={ isSavingSettings }
							onButtonClick={ handleSubmitForm }
							showButton
							title={ translate( 'Media' ) }
						/>
						<MediaSettingsWriting
							siteId={ siteId }
							handleAutosavingToggle={ handleAutosavingToggle }
							onChangeField={ onChangeField }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							fields={ fields }
						/>
					</div>
				) }

				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Watermark' ) }
				/>
				<MediaSettingsWatermark
					siteId={ siteId }
					handleAutosavingToggle={ handleAutosavingToggle }
					onChangeField={ onChangeField }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>

				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Content types' ) }
				/>
				<CustomContentTypes
					handleAutosavingToggle={ handleAutosavingToggle }
					onChangeField={ onChangeField }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>

				<FeedSettings
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					handleSubmitForm={ handleSubmitForm }
					handleToggle={ handleToggle }
					onChangeField={ onChangeField }
				/>

				{ isPodcastingSupported && <PodcastingLink fields={ fields } /> }

				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				<ThemeEnhancements
					onSubmitForm={ handleSubmitForm }
					handleAutosavingToggle={ handleAutosavingToggle }
					handleAutosavingRadio={ handleAutosavingRadio }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>

				{ siteIsJetpack && (
					<Widgets
						onSubmitForm={ handleSubmitForm }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
					/>
				) }

				{ siteIsJetpack && config.isEnabled( 'press-this' ) && (
					<PublishingTools
						onSubmitForm={ handleSubmitForm }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
					/>
				) }

				{ config.isEnabled( 'press-this' ) && ! this.isMobile() && ! siteIsJetpack && (
					<div>
						<SettingsSectionHeader
							title={ translate( 'Press This', { context: 'name of browser bookmarklet tool' } ) }
						/>
						<PressThis />
					</div>
				) }

				{ isMasterbarSectionVisible && (
					<div>
						<SettingsSectionHeader title={ translate( 'WordPress.com toolbar' ) } />
						<Masterbar
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
						/>
					</div>
				) }
			</form>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );
		const siteIsAutomatedTransfer = isSiteAutomatedTransfer( state, siteId );
		const isPodcastingSupported = ! siteIsJetpack || siteIsAutomatedTransfer;

		return {
			siteIsJetpack,
			siteId,
			isMasterbarSectionVisible:
				siteIsJetpack &&
				// Masterbar can't be turned off on Atomic sites - don't show the toggle in that case
				! siteIsAutomatedTransfer,
			isPodcastingSupported,
			siteIsAutomatedTransfer,
		};
	},
	{ requestPostTypes }
);

const getFormSettings = ( settings ) => {
	const formSettings = pick( settings, [
		'posts_per_page',
		'posts_per_rss',
		'rss_use_excerpt',
		'default_post_format',
		'custom-content-types',
		'jetpack_testimonial',
		'jetpack_testimonial_posts_per_page',
		'jetpack_portfolio',
		'jetpack_portfolio_posts_per_page',
		'infinite-scroll',
		'infinite_scroll',
		'infinite_scroll_blocked',
		'minileven',
		'wp_mobile_excerpt',
		'wp_mobile_featured_images',
		'wp_mobile_app_promos',
		'post_by_email_address',
		'onpublish',
		'onupdate',
		'guess_lang',
		'Bias Language',
		'Cliches',
		'Complex Expression',
		'Diacritical Marks',
		'Double Negative',
		'Hidden Verbs',
		'Jargon Language',
		'Passive voice',
		'Phrases to Avoid',
		'Redundant Expression',
		'ignored_phrases',
		'carousel',
		'carousel_background_color',
		'carousel_display_exif',
		'display_watermark',
		'date_format',
		'start_of_week',
		'time_format',
		'timezone_string',
		'podcasting_category_id',
		'wpcom_publish_posts_with_markdown',
	] );

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = get( settings, 'gmt_offset' );
	const timezone_string = get( settings, 'timezone_string' );

	if ( ! timezone_string && typeof gmt_offset === 'string' && gmt_offset.length ) {
		formSettings.timezone_string = 'UTC' + ( /-/.test( gmt_offset ) ? '' : '+' ) + gmt_offset;
	}

	return formSettings;
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormWriting );

import { flowRight, get, pick } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FeedSettings from 'calypso/my-sites/site-settings/feed-settings';
import { requestPostTypes } from 'calypso/state/post-types/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Composing from './composing';
import CustomContentTypes from './custom-content-types';
import MediaSettingsWriting from './media-settings-writing';
import PublishingTools from './publishing-tools';
import ThemeEnhancements from './theme-enhancements';
import Widgets from './widgets';
import wrapSettingsForm from './wrap-settings-form';

class SiteSettingsFormWriting extends Component {
	render() {
		const {
			eventTracker,
			fields,
			handleSelect,
			handleToggle,
			handleAutosavingToggle,
			handleAutosavingRadio,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			siteId,
			siteIsJetpack,
			translate,
			isAtomic,
			updateFields,
		} = this.props;

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__writing-settings"
			>
				<Composing
					handleSubmitForm={ handleSubmitForm }
					translate={ translate }
					isAtomic={ isAtomic }
					siteIsJetpack={ siteIsJetpack }
					handleSelect={ handleSelect }
					handleToggle={ handleToggle }
					onChangeField={ onChangeField }
					eventTracker={ eventTracker }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					updateFields={ updateFields }
				/>

				{ siteIsJetpack && ! isAtomic && (
					<MediaSettingsWriting
						handleSubmitForm={ handleSubmitForm }
						siteId={ siteId }
						handleAutosavingToggle={ handleAutosavingToggle }
						onChangeField={ onChangeField }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
					/>
				) }

				<CustomContentTypes
					handleSubmitForm={ handleSubmitForm }
					handleAutosavingToggle={ handleAutosavingToggle }
					onChangeField={ onChangeField }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					isAtomic={ isAtomic }
					siteIsJetpack={ siteIsJetpack }
				/>

				<FeedSettings
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					handleSubmitForm={ handleSubmitForm }
					handleToggle={ handleToggle }
					onChangeField={ onChangeField }
					translate={ translate }
				/>

				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				<ThemeEnhancements
					isAtomic={ isAtomic }
					onSubmitForm={ handleSubmitForm }
					handleAutosavingToggle={ handleAutosavingToggle }
					handleAutosavingRadio={ handleAutosavingRadio }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					siteId={ siteId }
					siteIsJetpack={ siteIsJetpack }
				/>

				{ siteIsJetpack && (
					<Widgets
						isAtomic={ isAtomic }
						translate={ translate }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
					/>
				) }

				<PublishingTools
					fields={ fields }
					isAtomic={ isAtomic }
					siteId={ siteId }
					siteIsJetpack={ siteIsJetpack }
				/>
			</form>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );
		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const isPodcastingSupported = ! siteIsJetpack || isAtomic;

		return {
			siteIsJetpack,
			siteId,
			isPodcastingSupported,
			isAtomic,
		};
	},
	{ requestPostTypes }
);

const getFormSettings = ( settings ) => {
	const formSettings = pick( settings, [
		'posts_per_page',
		'posts_per_rss',
		'rss_use_excerpt',
		'default_category',
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
		'date_format',
		'start_of_week',
		'time_format',
		'timezone_string',
		'wpcom_publish_posts_with_markdown',
		'featured_image_email_enabled',
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

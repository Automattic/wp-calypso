import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ReaderSettingsSection from '../reader-settings';
import { FediverseSettingsSection } from '../reading-fediverse-settings';
import { NewsletterSettingsSection } from '../reading-newsletter-settings';
import { RssFeedSettingsSection } from '../reading-rss-feed-settings';
import { SiteSettingsSection } from '../reading-site-settings';
import wrapSettingsForm from '../wrap-settings-form';

const isEnabled = config.isEnabled( 'settings/modernize-reading-settings' );

export type SubscriptionOptions = {
	invitation: string;
	comment_follow: string;
};

type Fields = {
	jetpack_relatedposts_enabled?: boolean;
	jetpack_relatedposts_show_context?: boolean;
	jetpack_relatedposts_show_date?: boolean;
	jetpack_relatedposts_show_headline?: boolean;
	jetpack_relatedposts_show_thumbnails?: boolean;
	page_for_posts?: string;
	page_on_front?: string;
	posts_per_page?: number;
	posts_per_rss?: number;
	rss_use_excerpt?: boolean;
	show_on_front?: 'posts' | 'page';
	subscription_options?: SubscriptionOptions;
	wpcom_featured_image_in_email?: boolean;
	wpcom_reader_views_enabled?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	sm_enabled?: boolean;
};

const getFormSettings = ( settings: unknown & Fields ) => {
	if ( ! settings ) {
		return {};
	}

	const {
		jetpack_relatedposts_enabled,
		jetpack_relatedposts_show_context,
		jetpack_relatedposts_show_date,
		jetpack_relatedposts_show_headline,
		jetpack_relatedposts_show_thumbnails,
		page_for_posts,
		page_on_front,
		posts_per_page,
		posts_per_rss,
		rss_use_excerpt,
		show_on_front,
		subscription_options,
		wpcom_featured_image_in_email,
		wpcom_reader_views_enabled,
		wpcom_subscription_emails_use_excerpt,
		sm_enabled,
	} = settings;

	return {
		jetpack_relatedposts_enabled: !! jetpack_relatedposts_enabled,
		jetpack_relatedposts_show_context: !! jetpack_relatedposts_show_context,
		jetpack_relatedposts_show_date: !! jetpack_relatedposts_show_date,
		jetpack_relatedposts_show_headline: !! jetpack_relatedposts_show_headline,
		jetpack_relatedposts_show_thumbnails: !! jetpack_relatedposts_show_thumbnails,
		page_for_posts: page_for_posts ?? '',
		page_on_front: page_on_front ?? '',
		...( posts_per_page && { posts_per_page } ),
		...( posts_per_rss && { posts_per_rss } ),
		...( rss_use_excerpt && { rss_use_excerpt } ),
		...( show_on_front && { show_on_front } ),
		...( subscription_options && { subscription_options } ),
		wpcom_featured_image_in_email: !! wpcom_featured_image_in_email,
		wpcom_reader_views_enabled: !! wpcom_reader_views_enabled,
		wpcom_subscription_emails_use_excerpt: !! wpcom_subscription_emails_use_excerpt,
		sm_enabled: !! sm_enabled,
	};
};

const connectComponent = connect( ( state: IAppState ) => {
	const siteId = getSelectedSiteId( state );
	const siteUrl = siteId && getSiteUrl( state, siteId );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	return {
		...( siteUrl && { siteUrl } ),
		siteIsJetpack,
		isAtomic,
	};
} );

type ReadingSettingsFormProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleAutosavingToggle: ( field: string ) => () => void;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	isAtomic: boolean | null;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	settings: { subscription_options?: SubscriptionOptions };
	siteIsJetpack: boolean | null;
	siteUrl?: string;
	updateFields: ( fields: Fields ) => void;
};

const ReadingSettingsForm = wrapSettingsForm( getFormSettings )(
	connectComponent(
		( {
			fields,
			onChangeField,
			handleAutosavingToggle,
			handleSubmitForm,
			handleToggle,
			isAtomic,
			isRequestingSettings,
			isSavingSettings,
			settings,
			siteIsJetpack,
			siteUrl,
			updateFields,
		}: ReadingSettingsFormProps ) => {
			const disabled = isRequestingSettings || isSavingSettings;
			const savedSubscriptionOptions = settings?.subscription_options;
			return (
				<form onSubmit={ handleSubmitForm }>
					<SiteSettingsSection
						fields={ fields }
						onChangeField={ onChangeField }
						handleToggle={ handleToggle }
						handleSubmitForm={ handleSubmitForm }
						disabled={ disabled }
						isRequestingSettings={ isRequestingSettings }
						isSavingSettings={ isSavingSettings }
						updateFields={ updateFields }
					/>
					<NewsletterSettingsSection
						fields={ fields }
						handleToggle={ handleToggle }
						handleSubmitForm={ handleSubmitForm }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
						savedSubscriptionOptions={ savedSubscriptionOptions }
						updateFields={ updateFields }
					/>
					<ReaderSettingsSection
						fields={ fields }
						handleAutosavingToggle={ handleAutosavingToggle }
						isRequestingSettings={ isRequestingSettings }
						isSavingSettings={ isSavingSettings }
						isAtomic={ isAtomic }
						siteIsJetpack={ siteIsJetpack }
					/>
					{ config.isEnabled( 'fediverse/allow-opt-in' ) && <FediverseSettingsSection /> }
					<RssFeedSettingsSection
						fields={ fields }
						onChangeField={ onChangeField }
						handleSubmitForm={ handleSubmitForm }
						updateFields={ updateFields }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
						siteUrl={ siteUrl }
					/>
				</form>
			);
		}
	)
);

const ReadingSettings = () => {
	const translate = useTranslate();

	if ( ! isEnabled ) {
		return null;
	}

	return (
		<Main className="site-settings site-settings__reading-settings">
			<ScreenOptionsTab wpAdminPath="options-reading.php" />
			<DocumentHead title={ translate( 'Reading Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Reading Settings' ) } align="left" />
			<ReadingSettingsForm />
		</Main>
	);
};

export default ReadingSettings;

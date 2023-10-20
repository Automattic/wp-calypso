import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import { useIsJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug, getSiteUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ReaderSettingsSection from '../reader-settings';
import { RssFeedSettingsSection } from '../reading-rss-feed-settings';
import { SiteSettingsSection } from '../reading-site-settings';
import wrapSettingsForm from '../wrap-settings-form';

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
	date_format?: string;
	timezone_string?: string;
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
		date_format,
		timezone_string,
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
		date_format: date_format,
		timezone_string: timezone_string,
	};
};

const connectComponent = connect( ( state: IAppState ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = siteId && getSiteSlug( state, siteId );
	const siteUrl = siteId && getSiteUrl( state, siteId );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	return {
		...( siteSlug && { siteSlug } ),
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
	siteIsJetpack: boolean | null;
	siteSlug?: string;
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
			siteIsJetpack,
			siteSlug,
			siteUrl,
			updateFields,
		}: ReadingSettingsFormProps ) => {
			const translate = useTranslate();
			const disabled = isRequestingSettings || isSavingSettings;
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

					{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
					<SettingsSectionHeader
						id="newsletter-settings"
						title={ translate( 'Newsletter settings' ) }
					/>
					<Card className="site-settings__card">
						<em>
							{ translate( 'Newsletter settings have moved to their {{a}}own page{{/a}}.', {
								components: {
									a: <a href={ `/settings/newsletter/${ siteSlug }` } />,
								},
							} ) }
						</em>
					</Card>
					<ReaderSettingsSection
						fields={ fields }
						handleAutosavingToggle={ handleAutosavingToggle }
						isRequestingSettings={ isRequestingSettings }
						isSavingSettings={ isSavingSettings }
						isAtomic={ isAtomic }
						siteIsJetpack={ siteIsJetpack }
					/>
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
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isPossibleJetpackConnectionProblem = useIsJetpackConnectionProblem( siteId as number );

	return (
		<Main className="site-settings site-settings__reading-settings">
			<ScreenOptionsTab wpAdminPath="options-reading.php" />
			{ isJetpack && isPossibleJetpackConnectionProblem && siteId && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			<DocumentHead title={ translate( 'Reading Settings' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'Reading Settings' ) } />
			<ReadingSettingsForm />
		</Main>
	);
};

export default ReadingSettings;

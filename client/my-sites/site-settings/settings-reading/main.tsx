import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state';
import { useIsJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { RssFeedSettingsSection } from '../reading-rss-feed-settings';
import { SiteSettingsSection } from '../reading-site-settings';
import wrapSettingsForm from '../wrap-settings-form';

export type SubscriptionOptions = {
	invitation: string;
	comment_follow: string;
	welcome: string;
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
	jetpack_subscribe_overlay_enabled?: boolean;
	jetpack_subscriptions_subscribe_post_end_enabled?: boolean;
	jetpack_subscriptions_subscribe_navigation_enabled?: boolean;
	jetpack_subscriptions_login_navigation_enabled?: boolean;
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
		jetpack_subscribe_overlay_enabled,
		jetpack_subscriptions_subscribe_post_end_enabled,
		jetpack_subscriptions_subscribe_navigation_enabled,
		jetpack_subscriptions_login_navigation_enabled,
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
		jetpack_subscribe_overlay_enabled: !! jetpack_subscribe_overlay_enabled,
		jetpack_subscriptions_subscribe_post_end_enabled:
			!! jetpack_subscriptions_subscribe_post_end_enabled,
		jetpack_subscriptions_subscribe_navigation_enabled:
			!! jetpack_subscriptions_subscribe_navigation_enabled,
		jetpack_subscriptions_login_navigation_enabled:
			!! jetpack_subscriptions_login_navigation_enabled,
		date_format: date_format,
		timezone_string: timezone_string,
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
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	isAtomic: boolean | null;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	siteIsJetpack: boolean | null;
	siteUrl?: string;
	updateFields: ( fields: Fields ) => void;
};

const ReadingSettingsForm = wrapSettingsForm( getFormSettings )(
	connectComponent(
		( {
			fields,
			onChangeField,
			handleSubmitForm,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			siteUrl,
			updateFields,
		}: ReadingSettingsFormProps ) => {
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
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isPossibleJetpackConnectionProblem = useIsJetpackConnectionProblem( siteId as number );

	return (
		<Main className="site-settings site-settings__reading-settings">
			{ isJetpack && isPossibleJetpackConnectionProblem && siteId && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			<DocumentHead title={ translate( 'Reading Settings' ) } />
			<NavigationHeader
				screenOptionsTab="options-reading.php"
				navigationItems={ [] }
				title={ translate( 'Reading Settings' ) }
			/>
			<ReadingSettingsForm />
		</Main>
	);
};

export default ReadingSettings;

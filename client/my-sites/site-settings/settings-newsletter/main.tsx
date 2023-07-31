import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { NewsletterSettingsSection } from '../reading-newsletter-settings';
import wrapSettingsForm from '../wrap-settings-form';

export type SubscriptionOptions = {
	invitation: string;
	comment_follow: string;
};

type Fields = {
	subscription_options?: SubscriptionOptions;
	wpcom_featured_image_in_email?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	sm_enabled?: boolean;
};

const getFormSettings = ( settings: unknown & Fields ) => {
	if ( ! settings ) {
		return {};
	}

	const {
		subscription_options,
		wpcom_featured_image_in_email,
		wpcom_subscription_emails_use_excerpt,
		sm_enabled,
	} = settings;

	return {
		...( subscription_options && { subscription_options } ),
		wpcom_featured_image_in_email: !! wpcom_featured_image_in_email,
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

type NewsletterSettingsFormProps = {
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

const NewsletterSettingsForm = wrapSettingsForm( getFormSettings )(
	connectComponent(
		( {
			fields,
			handleSubmitForm,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			settings,
			updateFields,
		}: NewsletterSettingsFormProps ) => {
			const disabled = isRequestingSettings || isSavingSettings;
			const savedSubscriptionOptions = settings?.subscription_options;
			return (
				<form onSubmit={ handleSubmitForm }>
					<NewsletterSettingsSection
						fields={ fields }
						handleToggle={ handleToggle }
						handleSubmitForm={ handleSubmitForm }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
						savedSubscriptionOptions={ savedSubscriptionOptions }
						updateFields={ updateFields }
					/>
				</form>
			);
		}
	)
);

const NewsletterSettings = () => {
	const translate = useTranslate();

	return (
		<Main>
			<DocumentHead title={ translate( 'Newsletter Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Newsletter Settings' ) } align="left" />
			<NewsletterSettingsForm />
		</Main>
	);
};

export default NewsletterSettings;

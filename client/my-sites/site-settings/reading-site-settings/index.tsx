import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import SupportInfo from 'calypso/components/support-info';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite as isJetpackSiteSelector } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { BlogPagesSetting, BLOG_PAGES_OPTION } from './BlogPagesSetting';
import { RelatedPostsSetting } from './RelatedPostsSetting';
import YourHomepageDisplaysSetting from './YourHomepageDisplaysSetting';

type Fields = {
	jetpack_relatedposts_enabled?: boolean;
	jetpack_relatedposts_show_context?: boolean;
	jetpack_relatedposts_show_date?: boolean;
	jetpack_relatedposts_show_headline?: boolean;
	jetpack_relatedposts_show_thumbnails?: boolean;
	page_for_posts?: string;
	page_on_front?: string;
	posts_per_page?: number;
	show_on_front?: 'posts' | 'page';
};

type SiteSettingsSectionProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	handleToggle?: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	disabled?: boolean;
	isRequestingSettings?: boolean;
	isSavingSettings?: boolean;
	updateFields: ( fields: Fields ) => void;
};

export const SiteSettingsSection = ( {
	fields,
	onChangeField,
	handleToggle,
	handleSubmitForm,
	disabled,
	isRequestingSettings,
	isSavingSettings,
	updateFields,
}: SiteSettingsSectionProps ) => {
	const translate = useTranslate();
	const { page_for_posts, page_on_front, posts_per_page, show_on_front } = fields;
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || 0;
	const isJetpack = useSelector( ( state ) => isJetpackSiteSelector( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	useEffect( () => {
		setTimeout( () => scrollToAnchor( { offset: 15 } ) );
	}, [] );

	return (
		<>
			<SettingsSectionHeader
				title={ translate( 'Site settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card className="site-settings__card site-settings__your-homepage-display-container">
				<YourHomepageDisplaysSetting
					value={ { page_for_posts, page_on_front, show_on_front } }
					onChange={ ( value ) => {
						updateFields( value );
					} }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<BlogPagesSetting
					value={ posts_per_page }
					onChange={ onChangeField( BLOG_PAGES_OPTION ) }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<SupportInfo
					text={ translate(
						'The feature helps visitors find more of your content by displaying related posts at the bottom of each post.'
					) }
					link={
						isJetpackSelfHosted
							? localizeUrl( 'https://jetpack.com/support/related-posts/' )
							: localizeUrl(
									'https://wordpress.com/support/related-posts/#related-posts-classic-themes'
							  )
					}
					privacyLink={
						isJetpackSelfHosted ? true : localizeUrl( 'https://automattic.com/privacy/' )
					}
				/>
				<RelatedPostsSetting
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					isJetpackSelfHosted={ isJetpackSelfHosted }
				/>
			</Card>
		</>
	);
};

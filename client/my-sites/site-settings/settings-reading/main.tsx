import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { NewsletterSettingsSection } from './newsletter-settings-section';
import { RssFeedSettingsSection } from './rss-feed-settings-section';
import SiteSettingsSection from './site-settings-section';

const isEnabled = config.isEnabled( 'settings/modernize-reading-settings' );

const ReadingSettings = () => {
	const translate = useTranslate();

	if ( ! isEnabled ) {
		return null;
	}

	return (
		<Main className="site-settings">
			<DocumentHead title={ translate( 'Reading Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Reading Settings' ) } align="left" />
			<form>
				<SiteSettingsSection />
				<RssFeedSettingsSection />
				<NewsletterSettingsSection />
			</form>
		</Main>
	);
};

export default ReadingSettings;

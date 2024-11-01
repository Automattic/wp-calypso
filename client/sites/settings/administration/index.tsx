import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import SiteTools from 'calypso/my-sites/site-settings/site-tools';
import { SOURCE_SETTINGS_ADMINISTRATION } from 'calypso/my-sites/site-settings/site-tools/utils';

export default function AdministrationSettings() {
	const translate = useTranslate();

	return (
		<div className="administration-settings">
			<NavigationHeader title={ translate( 'Administration' ) } />
			<SiteTools source={ SOURCE_SETTINGS_ADMINISTRATION } />
		</div>
	);
}

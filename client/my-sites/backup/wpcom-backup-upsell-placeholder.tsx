import { useTranslate } from 'i18n-calypso';
import WpcomUpsellPlaceholder from 'calypso/components/jetpack/wpcom-upsell-placeholder';
import NavigationHeader from 'calypso/components/navigation-header';

export default function WpcomBackupUpsellPlaceholder() {
	const translate = useTranslate();
	return (
		<>
			<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack VaultPress Backup' ) } />
			<WpcomUpsellPlaceholder />
		</>
	);
}

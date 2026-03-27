import { useTranslate } from 'i18n-calypso';
import WpcomUpsellPlaceholder from 'calypso/components/jetpack/wpcom-upsell-placeholder';
import JetpackTitle from 'calypso/components/jetpack-title';
import NavigationHeader from 'calypso/components/navigation-header';

export default function WpcomBackupUpsellPlaceholder() {
	const translate = useTranslate();
	return (
		<>
			<NavigationHeader
				navigationItems={ [] }
				title={ <JetpackTitle title={ translate( 'Backup' ) } /> }
				subtitle={ translate( 'Save changes and restore quickly with one-click recovery.' ) }
			/>
			<WpcomUpsellPlaceholder />
		</>
	);
}

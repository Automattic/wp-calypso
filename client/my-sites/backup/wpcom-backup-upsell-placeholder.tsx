import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import WpcomUpsellPlaceholder from 'calypso/components/jetpack/wpcom-upsell-placeholder';
import JetpackTitle from 'calypso/components/jetpack-title';

export default function WpcomBackupUpsellPlaceholder() {
	const translate = useTranslate();
	return (
		<Page
			hasPadding
			showSidebarToggle={ false }
			title={ <JetpackTitle title={ translate( 'Backup' ) } /> }
			subTitle={ translate( 'Save changes and restore quickly with one-click recovery.' ) }
		>
			<WpcomUpsellPlaceholder />
		</Page>
	);
}

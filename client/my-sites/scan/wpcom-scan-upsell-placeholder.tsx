import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import WpcomUpsellPlaceholder from 'calypso/components/jetpack/wpcom-upsell-placeholder';
import JetpackTitle from 'calypso/components/jetpack-title';

export default function WpcomScanUpsellPlaceholder() {
	const translate = useTranslate();
	return (
		<Page
			hasPadding
			showSidebarToggle={ false }
			title={ <JetpackTitle title={ translate( 'Scan' ) } /> }
			subTitle={ translate( 'Automated malware scanning and firewall protection.' ) }
		>
			<WpcomUpsellPlaceholder />
		</Page>
	);
}

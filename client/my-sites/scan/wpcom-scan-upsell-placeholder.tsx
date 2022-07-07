import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import WpcomUpsellPlaceholder from 'calypso/components/jetpack/wpcom-upsell-placeholder';

export default function WpcomScanUpsellPlaceholder() {
	const translate = useTranslate();
	return (
		<>
			<FormattedHeader brandFont headerText={ translate( 'Jetpack Scan' ) } align="left" />
			<WpcomUpsellPlaceholder />
		</>
	);
}

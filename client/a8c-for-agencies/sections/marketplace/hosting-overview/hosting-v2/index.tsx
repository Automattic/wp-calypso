import { useTranslate } from 'i18n-calypso';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v2';

export default function HostingV2() {
	const translate = useTranslate();

	return (
		<>
			<span>{ translate( "Choose the hosting tailored for your client's needs." ) }</span>
			Append the URL with `?flags=-a4a-hosting-page-redesign` to see the old design.
			<MigrationOffer />
		</>
	);
}

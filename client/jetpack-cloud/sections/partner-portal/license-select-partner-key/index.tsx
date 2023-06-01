import { Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import { useSelector } from 'calypso/state';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasActivePartnerKey,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { PartnerKey } from 'calypso/state/partner-portal/types';

export default function LicenseSelectPartnerKey() {
	const translate = useTranslate();
	const hasKey = useSelector( hasActivePartnerKey );
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = ( partner?.keys || [] ) as PartnerKey[];
	const showKeys = hasFetched && ! isFetching && keys.length > 0;

	useReturnUrl( hasKey );

	return (
		<Main>
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Licensing' ) }</CardHeading>

			{ isFetching && <Spinner /> }

			{ showKeys && <SelectPartnerKey /> }
		</Main>
	);
}

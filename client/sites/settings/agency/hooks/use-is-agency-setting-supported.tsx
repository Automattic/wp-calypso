import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function useIsAgencySettingSupported() {
	const site = useSelector( getSelectedSite );
	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID ?? 0, { enabled: !! site?.ID } );

	const isAtomicSite = site?.is_wpcom_atomic;

	return !! agencySite && isAtomicSite;
}

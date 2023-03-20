import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function SiteLogs() {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<>
			<h2>Site logs for { siteId }</h2>
		</>
	);
}

import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function SiteMetrics() {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<>
			<h2>Metrics for { siteId }</h2>
		</>
	);
}

import styled from '@emotion/styled';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
interface SitesStagingBadgeProps {
	secondary?: boolean;
}

const SitesStagingBadge = styled( SitesLaunchStatusBadge )( ( props: SitesStagingBadgeProps ) => ( {
	color: '#4f3500',
	backgroundColor: '#f0c930',
	marginRight: props.secondary ? 3 : 0,
	borderRadius: props.secondary ? 12 : 4,
	'.current-site .site:hover &, .notouch .layout__secondary .site-selector.is-hover-enabled .site:hover  &':
		{
			color: '#1C1300',
			backgroundColor: '#C08C00',
		},
} ) );

export default SitesStagingBadge;

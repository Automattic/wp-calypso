import styled from '@emotion/styled';
import SitesLaunchStatusBadge from './sites-launch-status-badge';

interface SitesStagingBadgeProps {
	secondary?: boolean;
}

const COLOR = 'var( --studio-gray-90 )';
const BACKGROUND_COLOR = '#dcdcde';

const SitesStagingBadge = styled( SitesLaunchStatusBadge )( ( props: SitesStagingBadgeProps ) => ( {
	color: COLOR,
	backgroundColor: BACKGROUND_COLOR,
	borderRadius: props.secondary ? 12 : 4,
	'.layout__secondary .site-selector &.site__badge, .layout__secondary &.site__badge': {
		color: COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	'.notouch .layout__secondary .site-selector.is-hover-enabled .site:hover  &': {
		color: '#1C1300',
		backgroundColor: '#C08C00',
	},
} ) );

export default SitesStagingBadge;

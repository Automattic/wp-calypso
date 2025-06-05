import styled from '@emotion/styled';
import SitesLaunchStatusBadge from './sites-launch-status-badge';

interface Props {
	secondary?: boolean;
}

const COLOR = '#02395c';
const BACKGROUND_COLOR = '#bbe0fa';

const SitesMigrationTrialBadge = styled( SitesLaunchStatusBadge )( ( props: Props ) => ( {
	color: COLOR,
	backgroundColor: BACKGROUND_COLOR,
	borderRadius: props.secondary ? 12 : 4,
	'.layout__secondary .site-selector &.site__badge, .layout__secondary &.site__badge': {
		color: COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	'.notouch .layout__secondary .site-selector.is-hover-enabled .site:hover  &': {
		color: '#001621',
		backgroundColor: '#68b3e8',
	},
} ) );

export default SitesMigrationTrialBadge;

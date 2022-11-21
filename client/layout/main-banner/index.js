import { Card } from '@automattic/components';
import './style.css';

export function MainBanner( { sectionName } ) {
	const allowList = [ 'posts', 'media', 'pages', 'home' ];
	if ( ! allowList.includes( sectionName ) ) {
		return null;
	}
	return <Card className="main-banner">This will be a Launchpad banner.</Card>;
}

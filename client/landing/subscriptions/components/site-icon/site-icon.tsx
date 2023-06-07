import { Gridicon } from '@automattic/components';
import './styles.scss';

type SiteIconProps = {
	iconUrl?: string;
	size?: number;
	siteName?: string;
};

const SiteIcon = ( { iconUrl, size = 48, siteName }: SiteIconProps ) => {
	if ( ! iconUrl ) {
		return <Gridicon className="site-icon" icon="globe" size={ size } />;
	}

	return (
		<img className="site-icon" src={ iconUrl } height={ size } width={ size } alt={ siteName } />
	);
};

export default SiteIcon;

import { WordPressLogo } from '@automattic/components';
import clsx from 'clsx';
import SiteIcon from 'calypso/blocks/site-icon';

import './style.scss';

interface SiteFaviconProps {
	blogId?: number;
	isDotcomSite?: boolean;
	color?: string;
	size?: number;
	className?: string;
}

const SiteFavicon = ( {
	blogId,
	color,
	isDotcomSite = false,
	size = 40,
	className = '',
}: SiteFaviconProps ) => {
	const siteColor = color ?? 'linear-gradient(45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4)';

	const defaultFavicon = isDotcomSite ? (
		<WordPressLogo className="wpcom-favicon" size={ size * 0.8 } />
	) : (
		<div className="no-favicon" style={ { background: siteColor } } />
	);

	return (
		<div className={ clsx( 'site-favicon', className ) }>
			<SiteIcon siteId={ blogId } size={ size } defaultIcon={ defaultFavicon } />
		</div>
	);
};

export default SiteFavicon;

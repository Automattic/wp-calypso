import { WordPressLogo } from '@automattic/components';
import classNames from 'classnames';
import SiteIcon from 'calypso/blocks/site-icon';
import { Site } from '../types';

import './style.scss';

interface SiteFaviconProps {
	site: Site;
	size?: number;
	className?: string;
}

const SiteFavicon = ( { site, size = 40, className = '' }: SiteFaviconProps ) => {
	const defaultFavicon = site.is_atomic ? (
		<WordPressLogo className="wpcom-favicon" size={ size * 0.8 } />
	) : (
		<div className="no-favicon" />
	);

	return (
		<div className={ classNames( 'site-favicon', className ) }>
			<SiteIcon siteId={ site.blog_id } size={ size } defaultIcon={ defaultFavicon } />
		</div>
	);
};

export default SiteFavicon;

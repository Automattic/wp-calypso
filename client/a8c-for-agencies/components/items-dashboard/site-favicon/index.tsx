import { WordPressLogo } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import SiteIcon from 'calypso/blocks/site-icon';
import { getFirstGrapheme } from 'calypso/lib/string';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';

import './style.scss';

interface SiteFaviconProps {
	blogId?: number;
	isDotcomSite?: boolean;
	color?: string;
	size?: number;
	className?: string;
	fallback?: 'color' | 'wordpress-logo' | 'first-grapheme';
}

const SiteFavicon = ( {
	blogId,
	color,
	isDotcomSite = false,
	size = 40,
	className = '',
	fallback = 'color',
}: SiteFaviconProps ) => {
	const { __ } = useI18n();
	const siteColor = color ?? 'linear-gradient(45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4)';
	const site = useSelector( ( state ) => getSite( state, blogId ) );

	let defaultFavicon;
	if ( isDotcomSite || fallback === 'wordpress-logo' ) {
		defaultFavicon = <WordPressLogo className="wpcom-favicon" size={ size * 0.8 } />;
	} else if ( fallback === 'color' ) {
		defaultFavicon = <div className="no-favicon" style={ { background: siteColor } } />;
	} else if ( fallback === 'first-grapheme' ) {
		defaultFavicon = (
			<div role="img" aria-label={ __( 'Site Icon' ) }>
				{ getFirstGrapheme( site?.title ?? '' ) }
			</div>
		);
	}

	return (
		<div className={ classNames( 'site-favicon', className ) }>
			<SiteIcon siteId={ blogId } size={ size } defaultIcon={ defaultFavicon } />
		</div>
	);
};

export default SiteFavicon;

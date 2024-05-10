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
	color?: string;
	size?: number;
	className?: string;
	fallback?: 'color' | 'wordpress-logo' | 'first-grapheme';
}

const SiteFavicon = ( {
	blogId,
	color,
	size = 40,
	className = '',
	fallback = 'color',
}: SiteFaviconProps ) => {
	const { __ } = useI18n();
	const siteColor = color ?? 'linear-gradient(45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4)';
	const site = useSelector( ( state ) => getSite( state, blogId ) );

	let defaultFavicon;
	switch ( fallback ) {
		case 'wordpress-logo':
			defaultFavicon = <WordPressLogo className="wpcom-favicon" size={ size * 0.8 } />;
			break;
		case 'first-grapheme':
			defaultFavicon = (
				<div role="img" aria-label={ __( 'Site Icon' ) }>
					{ getFirstGrapheme( site?.title ?? '' ) }
				</div>
			);
			break;
		case 'color':
		default:
			defaultFavicon = <div className="no-favicon" style={ { background: siteColor } } />;
			break;
	}

	return (
		<div className={ classNames( 'site-favicon', className ) }>
			<SiteIcon siteId={ blogId } size={ size } defaultIcon={ defaultFavicon } />
		</div>
	);
};

export default SiteFavicon;

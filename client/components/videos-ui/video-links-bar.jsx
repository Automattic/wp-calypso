import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-links-bar.scss';

const VideoLinksBar = ( {
	displayIcon,
	displayLinks,
	isFooter = false,
	onBackClick = () => {},
	skipClickHandler = () => {},
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const classes = classNames( 'videos-ui__bar', isFooter ? 'mobile' : 'desktop' );

	return (
		<div
			className={ classNames( 'videos-ui__header-links', {
				'videos-ui__is-footer': isFooter,
			} ) }
		>
			{ displayIcon && <Gridicon icon="my-sites" size={ 24 } /> }
			{ displayLinks && (
				<div className={ classes }>
					<div>
						<a
							href="/"
							className={ classNames( {
								'videos-ui__back-link': displayIcon,
							} ) }
							onClick={ onBackClick }
						>
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
					<div className="videos-ui__bar-skip-link">
						<a href={ `/post/${ siteSlug }` } onClick={ skipClickHandler }>
							{ translate( 'Skip and draft first post' ) }
						</a>
					</div>
				</div>
			) }
		</div>
	);
};

export default VideoLinksBar;

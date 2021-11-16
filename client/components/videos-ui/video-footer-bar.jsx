import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-bar.scss';

const VideoFooterBar = ( {
	displayBackButton,
	displaySkipLink,
	onBackClick = () => {},
	skipClickHandler = () => {},
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div className={ 'videos-ui__header-links videos-ui__is-footer' }>
			<div className={ 'videos-ui__bar mobile' }>
				{ displayBackButton && (
					<div>
						<a href="/" onClick={ onBackClick }>
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
				) }
				{ displaySkipLink && (
					<div className="videos-ui__bar-skip-link">
						<a href={ `/post/${ siteSlug }` } onClick={ skipClickHandler }>
							{ translate( 'Draft your first post' ) }
						</a>
					</div>
				) }
			</div>
		</div>
	);
};

export default VideoFooterBar;

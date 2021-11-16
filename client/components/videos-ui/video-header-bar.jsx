import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-bar.scss';

const VideoHeaderBar = ( {
	displayIcon,
	displayLinks,
	displaySkipLink,
	onBackClick = () => {},
	skipClickHandler = () => {},
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div className={ 'videos-ui__bar' }>
			{ displayIcon && <Gridicon icon="my-sites" size={ 24 } /> }
			{ displayLinks && (
				<div className={ classNames( 'videos-ui__bar-content', 'desktop' ) }>
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
					{ displaySkipLink && (
						<div className="videos-ui__bar-skip-link">
							<a href={ `/post/${ siteSlug }` } onClick={ skipClickHandler }>
								{ translate( 'Draft your first post' ) }
							</a>
						</div>
					) }
				</div>
			) }
		</div>
	);
};

export default VideoHeaderBar;

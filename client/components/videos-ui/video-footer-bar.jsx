import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-bar.scss';

const VideoFooterBar = ( {
	context,
	isMobile,
	displayCTA,
	descriptionCTA = '',
	buttonTextCTA = '',
	hrefCTA = '',
	courseSlug = '',
	onBackClick = () => {},
	skipClickHandler = () => {},
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const onCTAButtonClick = () => {
		recordTracksEvent( 'calypso_courses_cta_click', {
			course: courseSlug,
		} );
	};

	let displayBackButton = false;
	const displaySkipLink = false;
	if ( context === 'modal' && isMobile ) {
		displayBackButton = true;
	}

	if ( ! displayBackButton && ! displaySkipLink && ! displayCTA ) {
		return null;
	}

	return (
		<div className={ 'videos-ui__bar videos-ui__is-footer' }>
			<div className={ 'videos-ui__bar-content' }>
				{ displayBackButton && (
					<div className={ 'videos-ui__back' }>
						<a href="/" onClick={ onBackClick }>
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
				) }
				{ displayCTA && (
					<div className={ 'videos-ui__cta' }>
						<div>{ descriptionCTA }</div>
						<Button onClick={ onCTAButtonClick } className="videos-ui__button" href={ hrefCTA }>
							<span>{ buttonTextCTA }</span>
						</Button>
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

import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-bar.scss';

const VideoFooterBar = ( {
	displayBackButton,
	displaySkipLink,
	displayCTA,
	descriptionCTA = '',
	buttonTextCTA = '',
	hrefCTA = '',
	onBackClick = () => {},
	skipClickHandler = () => {},
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div className={ 'videos-ui__bar videos-ui__is-footer' }>
			<div
				className={ classNames( 'videos-ui__bar-content', {
					mobile: ! displayCTA,
				} ) }
			>
				{ displayBackButton && (
					<div className={ 'videos-ui__mobile' }>
						<a href="/" onClick={ onBackClick }>
							<Gridicon icon="chevron-left" size={ 24 } />
							<span>{ translate( 'Back' ) }</span>
						</a>
					</div>
				) }
				{ displayCTA && (
					<div className={ 'videos-ui__cta' }>
						<div className={ 'videos-ui__desktop' }>{ descriptionCTA }</div>
						<Button className="videos-ui__button" href={ hrefCTA }>
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

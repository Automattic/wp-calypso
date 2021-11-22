import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './style-video-bar.scss';

const VideoHeaderBar = ( { context, onBackClick = () => {}, skipClickHandler = () => {} } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	let displayIcon = false;
	const displayBackLink = false;
	const displaySkipLink = false;
	let displayCloseLink = false;

	if ( context === 'modal' ) {
		displayIcon = true;
		displayCloseLink = true;
	}

	return (
		<div className={ 'videos-ui__bar' }>
			{ displayIcon && <Gridicon icon="my-sites" size={ 24 } /> }
			<div className={ classNames( 'videos-ui__bar-content', 'videos-ui__desktop' ) }>
				<div>
					{ displayBackLink && (
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
					) }
				</div>
				<div className="videos-ui__bar-skip-link">
					{ displaySkipLink && (
						<a href={ `/post/${ siteSlug }` } onClick={ skipClickHandler }>
							{ translate( 'Draft your first post' ) }
						</a>
					) }
					{ displayCloseLink && (
						<span role="button" onKeyDown={ onBackClick } tabIndex={ 0 } onClick={ onBackClick }>
							<Gridicon icon="cross" size={ 24 } />
						</span>
					) }
				</div>
			</div>
		</div>
	);
};

export default VideoHeaderBar;

import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

import './onboarding-header-bar.scss';

const OnboardingHeaderBar = ( { course = {}, onBackClick = () => {} } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const onBackLinkClick = ( event ) => {
		recordTracksEvent( 'calypso_courses_back_click', {
			course: course?.slug,
		} );
		onBackClick( event );
	};
	const onDraftFirstPostClick = () => {
		recordTracksEvent( 'calypso_courses_draft_first_post_click', {
			course: course?.slug,
		} );
	};
	return (
		<div className={ 'videos-ui__bar videos-ui__onboarding-header-bar' }>
			<div>
				<Gridicon icon="my-sites" size={ 24 } />
				<a href="/" className="videos-ui__back-link" onClick={ onBackLinkClick }>
					<Gridicon icon="chevron-left" size={ 24 } />
					<span>{ translate( 'Back' ) }</span>
				</a>
			</div>
			<a
				href={ `/post/${ siteSlug }` }
				className="videos-ui__draft-first-post-link"
				onClick={ onDraftFirstPostClick }
			>
				{ translate( 'Draft your first post' ) }
			</a>
		</div>
	);
};

export default OnboardingHeaderBar;

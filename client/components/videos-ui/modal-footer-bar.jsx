import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './modal-footer-bar.scss';

const ModalFooterBar = ( { onBackClick = () => {}, course = {}, isCourseComplete = false } ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const onBackLinkClick = ( event ) => {
		recordTracksEvent( 'calypso_courses_mobile_back_click', {
			course: course?.slug,
		} );
		onBackClick( event );
	};
	const onCourseCompletedCTAClick = () => {
		recordTracksEvent( 'calypso_courses_cta_click', {
			course: course?.slug,
		} );
	};

	const getCourseCompletedUrl = () => {
		if ( ! course?.cta?.url || ! selectedSite?.domain ) {
			return 'https://wordpress.com/post';
		}
		return `${ course.cta.url }/${ selectedSite.domain }`;
	};

	const getCTADescription = () => {
		if ( ! course?.cta?.description || course.cta.description === '' ) {
			return translate(
				"You did it! Now it's time to put your skills to work and draft your first post."
			);
		}
		return course.cta.description;
	};

	return (
		<div className="videos-ui__footer-bar">
			<div
				className={ clsx( 'videos-ui__bar videos-ui__modal-footer-bar', {
					'videos-ui__course-completed': isCourseComplete,
				} ) }
			>
				<a href="/" className="videos-ui__back-button" onClick={ onBackLinkClick }>
					<Gridicon icon="chevron-left" size={ 24 } />
					<span>{ translate( 'Back' ) }</span>
				</a>
				{ isCourseComplete && <p>{ getCTADescription() }</p> }

				{ isCourseComplete && (
					<Button
						onClick={ onCourseCompletedCTAClick }
						className="videos-ui__button"
						href={ getCourseCompletedUrl() }
					>
						{ course?.cta.action }
					</Button>
				) }
			</div>
		</div>
	);
};

export default ModalFooterBar;

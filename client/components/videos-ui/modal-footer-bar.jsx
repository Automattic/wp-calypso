import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './modal-footer-bar.scss';

const ModalFooterBar = ( {
	onBackClick = () => {},
	course = {},
	isCourseComplete = false,
	showDraftFirstPostLink = false,
} ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const onBackLinkClick = ( event ) => {
		recordTracksEvent( 'calypso_courses_mobile_back_click', {
			course: course?.slug,
		} );
		onBackClick( event );
	};
	const onStartWritingClick = () => {
		recordTracksEvent( 'calypso_courses_cta_click', {
			course: course?.slug,
		} );
	};

	const getStartWritingUrl = () => {
		if ( ! course?.cta?.url && ! selectedSite?.domain ) {
			return 'https://wordpress.com/post/';
		}

		if ( ! course?.cta?.url && selectedSite?.domain ) {
			return `https://wordpress.com/post/${ selectedSite.domain }`;
		}

		return `${ course.cta.url }/${ selectedSite.domain }`;
	};

	const onDraftFirstPostClick = () => {
		recordTracksEvent( 'calypso_courses_draft_first_post_click', {
			course: course?.slug,
		} );
	};

	return (
		<div className="videos-ui__footer-bar">
			<div
				className={ classNames( 'videos-ui__bar videos-ui__modal-footer-bar', {
					'videos-ui__course-completed': isCourseComplete,
				} ) }
			>
				<a href="/" className={ 'videos-ui__back-button' } onClick={ onBackLinkClick }>
					<Gridicon icon="chevron-left" size={ 24 } />
					<span>{ translate( 'Back' ) }</span>
				</a>
				{ ! isCourseComplete && showDraftFirstPostLink && (
					<a
						href={ getStartWritingUrl() }
						className="videos-ui__draft-first-post-link"
						onClick={ onDraftFirstPostClick }
					>
						{ translate( 'Draft your first post' ) }
					</a>
				) }
				{ isCourseComplete && (
					<p>
						{ translate(
							"You did it! Now it's time to put your skills to work and draft your first post."
						) }
					</p>
				) }

				{ isCourseComplete && (
					<Button
						onClick={ onStartWritingClick }
						className="videos-ui__button"
						href={ getStartWritingUrl() }
					>
						{ course?.cta.action }
					</Button>
				) }
			</div>
		</div>
	);
};

export default ModalFooterBar;

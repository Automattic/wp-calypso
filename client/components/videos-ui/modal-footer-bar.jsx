import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './modal-footer-bar.scss';

const ModalFooterBar = ( { onBackClick = () => {}, course = {}, isCourseComplete = false } ) => {
	const translate = useTranslate();
	const onBackLinkClick = ( event ) => {
		recordTracksEvent( 'calypso_courses_mobile_back_click', {
			course: course?.slug,
		} );
		onBackClick( event );
	};

	return (
		<div className={ 'videos-ui__bar videos-ui__footer-bar videos-ui__modal-footer-bar' }>
			<a href="/" onClick={ onBackLinkClick }>
				<Gridicon icon="chevron-left" size={ 24 } />
				<span>{ translate( 'Back' ) }</span>
			</a>
			{ isCourseComplete && (
				<Button className="videos-ui__button">{ translate( 'Start writing' ) }</Button>
			) }
		</div>
	);
};

export default ModalFooterBar;

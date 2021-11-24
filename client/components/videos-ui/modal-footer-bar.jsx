import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './modal-footer-bar.scss';

const ModalFooterBar = ( { onBackClick = () => {}, isComplete = false, course = {} } ) => {
	const translate = useTranslate();
	const onCTAButtonClick = () => {
		recordTracksEvent( 'calypso_courses_cta_click', {
			course: course?.slug,
		} );
	};

	return (
		<div className={ 'videos-ui__bar videos-ui__modal-footer-bar' }>
			<a href="/" onClick={ onBackClick }>
				<Gridicon icon="chevron-left" size={ 24 } />
				<span>{ translate( 'Back' ) }</span>
			</a>
			{ isComplete && Object.keys( course ).length && (
				<div className={ 'videos-ui__cta' }>
					<div className={ 'videos-ui__desktop' }>{ course?.cta?.description }</div>
					<Button
						onClick={ onCTAButtonClick }
						className="videos-ui__button"
						href={ course?.cta?.url }
					>
						<span>{ course?.cta?.action }</span>
					</Button>
				</div>
			) }
		</div>
	);
};

export default ModalFooterBar;

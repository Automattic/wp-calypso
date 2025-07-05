import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { UpcomingEventProps } from './types';
import './style.scss';

const UpcomingEvent = ( {
	date,
	title,
	subtitle,
	description,
	registrationUrl,
	logoUrl,
	imageUrl,
	trackEventName,
	dateClassName,
	imageClassName,
}: UpcomingEventProps ): JSX.Element => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const displayDate = date ? date.format( 'MMMM Do' ) : '';
	const dateTimeString = date ? date.format( 'YYYY-MM-DD' ) : undefined;

	const handleRegisterClick = (): void => {
		dispatch( recordTracksEvent( trackEventName ) );
	};

	return (
		<div className="a4a-event">
			<div className="a4a-event__content">
				<div className="a4a-event__header">
					<div className="a4a-event__logo">
						<img src={ logoUrl } alt={ title } />
					</div>
					<div className="a4a-event__date-and-title">
						<div className={ clsx( 'a4a-event__date', dateClassName ) }>
							<time dateTime={ dateTimeString }>{ displayDate }</time>
						</div>
						<h3 className="a4a-event__title">{ title }</h3>
						<p className="a4a-event__subtitle">{ subtitle }</p>
					</div>
				</div>

				<p className="a4a-event__description">{ description }</p>

				<Button
					className="a4a-event__button"
					variant="secondary"
					target="_blank"
					href={ registrationUrl }
					onClick={ handleRegisterClick }
				>
					{ translate( 'Register for free ↗' ) }
				</Button>
			</div>
			<div
				className={ clsx( 'a4a-event__image', imageClassName ) }
				style={ { backgroundImage: `url(${ imageUrl })` } }
			></div>
		</div>
	);
};

export default UpcomingEvent;

import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { UpcomingEventProps } from './types';

import './style.scss';

const UpcomingEvent = ( {
	date,
	title,
	subtitle,
	descriptions,
	cta,
	logoUrl,
	imageUrl,
	trackEventName,
	dateClassName,
	imageClassName,
	extraContent,
	id,
}: UpcomingEventProps ): JSX.Element => {
	const dispatch = useDispatch();

	const displayDate = useMemo( () => {
		if ( ! date ) {
			return '';
		}

		if ( date.from.isSame( date.to, 'day' ) ) {
			return date.to.format( 'MMMM Do' );
		}

		if ( date.from.isSame( date.to, 'month' ) ) {
			return `${ date.from.format( 'MMMM' ) } ${ date.from.format( 'Do' ) }-${ date.to.format(
				'Do'
			) }`;
		}

		return `${ date.from.format( 'MMMM Do' ) }-${ date.to.format( 'MMMM Do' ) }`;
	}, [ date ] );

	const dateTimeString = useMemo( () => {
		if ( ! date ) {
			return '';
		}

		if ( date.from.isSame( date.to, 'day' ) ) {
			return date.to.format( 'YYYY-MM-DD' );
		}

		return `${ date.from.format( 'YYYY-MM-DD' ) }/${ date.to.format( 'YYYY-MM-DD' ) }`;
	}, [ date ] );

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

				<div className="a4a-event__descriptions">
					{ descriptions.map( ( item, index ) => (
						<p key={ `event-${ id }-deescription-${ index }` }>{ item }</p>
					) ) }
				</div>

				<div className="a4a-event__footer">
					<Button
						className="a4a-event__button"
						variant="secondary"
						target="_blank"
						href={ cta.url }
						onClick={ handleRegisterClick }
					>
						{ cta.label }
					</Button>
					{ extraContent }
				</div>
			</div>
			<div
				className={ clsx( 'a4a-event__image', imageClassName ) }
				style={ { backgroundImage: `url(${ imageUrl })` } }
			></div>
		</div>
	);
};

export default UpcomingEvent;

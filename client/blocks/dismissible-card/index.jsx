import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { dismissCard } from './actions';
import useIsCardVisible from './use-is-card-visible';

import './style.scss';

/**
 * @param {{ className?: string; highlight?: 'error' | 'info' | 'success' | 'warning'; temporary?: boolean; onClick?: ( event: import('react').MouseEvent ) => void; onCardClick?: ( event: import('react').MouseEvent ) => void; preferenceName: string; href?: string; children?: import('react').ReactNode; }} props
 */
function DismissibleCard( {
	className,
	highlight,
	temporary,
	onClick,
	onCardClick,
	preferenceName,
	href,
	children,
} ) {
	const isVisible = useIsCardVisible( preferenceName );
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( ! isVisible ) {
		return null;
	}

	function handleClick( event ) {
		onClick?.( event );
		dispatch( dismissCard( preferenceName, temporary ) );
		event.preventDefault();
	}

	function handleCardClick( event ) {
		// The dismiss button prevents default, so its click bubbling up here must not count as a card click.
		if ( ! event.defaultPrevented ) {
			onCardClick?.( event );
		}
	}

	return (
		<Card
			className={ className }
			highlight={ highlight }
			href={ href }
			onClick={ onCardClick ? handleCardClick : undefined }
			showLinkIcon={ false }
		>
			<QueryPreferences />
			<button
				className="dismissible-card__close-button"
				onClick={ handleClick }
				aria-label={ translate( 'Dismiss' ) }
			>
				<Gridicon icon="cross" />
			</button>
			{ children }
		</Card>
	);
}

DismissibleCard.propTypes = {
	className: PropTypes.string,
	highlight: PropTypes.oneOf( [ 'error', 'info', 'success', 'warning' ] ),
	temporary: PropTypes.bool,
	onClick: PropTypes.func,
	onCardClick: PropTypes.func,
	preferenceName: PropTypes.string.isRequired,
	href: PropTypes.string,
};

export default DismissibleCard;

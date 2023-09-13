import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { dismissCard } from './actions';
import { isCardDismissed } from './selectors';

import './style.scss';

function DismissibleCard( {
	className,
	highlight,
	temporary,
	onClick,
	preferenceName,
	href,
	children,
} ) {
	const isDismissed = useSelector( isCardDismissed( preferenceName ) );
	const hasReceivedPreferences = useSelector( hasReceivedRemotePreferences );
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( isDismissed || ! hasReceivedPreferences ) {
		return null;
	}

	function handleClick( event ) {
		onClick?.( event );
		dispatch( dismissCard( preferenceName, temporary ) );
		event.preventDefault();
	}

	return (
		<Card className={ className } highlight={ highlight } href={ href } showLinkIcon={ false }>
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
	preferenceName: PropTypes.string.isRequired,
	href: PropTypes.string,
};

export default DismissibleCard;

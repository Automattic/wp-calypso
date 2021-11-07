import { Card, Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

import './style.scss';

const PREFERENCE_PREFIX = 'dismissible-card-';

function DismissibleCard( { className, highlight, temporary, onClick, preferenceName, children } ) {
	const preference = `${ PREFERENCE_PREFIX }${ preferenceName }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, preference ) );
	const hasReceivedPreferences = useSelector( hasReceivedRemotePreferences );
	const dispatch = useDispatch();

	if ( isDismissed || ! hasReceivedPreferences ) {
		return null;
	}

	function handleClick( event ) {
		onClick?.( event );
		dispatch( ( temporary ? setPreference : savePreference )( preference, true ) );
	}

	return (
		<Card className={ className } highlight={ highlight }>
			<QueryPreferences />
			<Gridicon icon="cross" className="dismissible-card__close-icon" onClick={ handleClick } />
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
};

export default DismissibleCard;

import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import ListEnd from 'calypso/components/list-end';
import { bumpStat } from 'calypso/state/analytics/actions';

import './style.scss';

function InvitesListEnd( { shown, found } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const bumped = useRef( false );

	useEffect( () => {
		if ( found > shown && ! bumped.current ) {
			dispatch( bumpStat( 'calypso_people_invite_list', 'displayed_max' ) );
			bumped.current = true;
		}
	}, [ dispatch, bumped, found, shown ] );

	return (
		<Fragment>
			{ shown < found && (
				<div className="people-invites__max-items-notice">
					{ translate(
						'Showing %(shown)d invite of %(found)d.',
						'Showing %(shown)d invites of %(found)d.',
						{ args: { shown, found } }
					) }
					<br />
					{ translate( 'To view more invites, clear some of your existing invites first.' ) }
				</div>
			) }
			<ListEnd />
		</Fragment>
	);
}

InvitesListEnd.propTypes = {
	shown: PropTypes.number,
	found: PropTypes.number,
};

export default InvitesListEnd;

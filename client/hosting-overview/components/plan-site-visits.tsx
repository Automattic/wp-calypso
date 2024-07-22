import { PAST_THIRTY_DAYS } from '@automattic/components';
import { useEffect } from 'react'; // eslint-disable-line no-unused-vars -- used in the jsdoc types
import { useDispatch, useSelector } from 'calypso/state';
import { requestHighlights } from 'calypso/state/stats/highlights/actions';
import { getHighlights } from 'calypso/state/stats/highlights/selectors';
import './style.scss';

interface PlanSiteVisitsProps {
	siteId: number;
}

export function PlanSiteVisits( { siteId }: PlanSiteVisitsProps ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestHighlights( siteId ) );
	}, [ dispatch, siteId ] );

	const highlights = useSelector( ( state ) => getHighlights( state, siteId ) );

	const data = highlights[ PAST_THIRTY_DAYS ];

	if ( ! data ) {
		return;
	}

	return (
		<div>
			<div
				style={ {
					display: 'flex',
					justifyContent: 'space-between',
					padding: '20px 0',
				} }
			>
				<div>Unlimited Site visits</div>
				<div title={ 'From ' + data.range.start + ' to ' + data.range.end }>
					{ data.views } views this month
				</div>
			</div>
			Go to Stats page
		</div>
	);
}

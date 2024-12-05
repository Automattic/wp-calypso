import { useDispatch, useSelector } from 'react-redux';
import { buildReaderTracksEventProps } from 'calypso/reader/stats';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getReaderFollowsCount } from '../follows/selectors';

interface EventProperties {
	[ key: string ]: string;
}
interface EventOptions {
	pathnameOverride?: string;
	post: object | null;
}

/**
 * A hook version of recordReaderTracksEvent action creator.
 */
export const useRecordReaderTracksEvent = () => {
	const dispatch = useDispatch();
	const follows = useSelector( getReaderFollowsCount );

	return (
		name: string,
		properties: EventProperties = {},
		{ pathnameOverride, post }: EventOptions = { post: null }
	): void => {
		const eventProps = buildReaderTracksEventProps( properties, pathnameOverride, post );
		dispatch( recordTracksEvent( name, { subscription_count: follows, ...eventProps } ) );
	};
};

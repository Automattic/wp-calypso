import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import Search from 'calypso/components/search';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	siteId: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filter: any;
}

const TextSelector: FunctionComponent< Props > = ( { siteId, filter } ) => {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const dispatch = useDispatch() as CalypsoDispatch;

	const placeholder = isMobile
		? translate( 'Search posts' )
		: translate( 'Search posts by ID, title or author' );

	const handleSearchActivities = ( query: string ) => {
		dispatch( updateFilter( siteId, { textSearch: query } ) );
		dispatch( recordTracksEvent( 'calypso_activitylog_filterbar_text_search' ) );
	};

	return (
		<Search
			compact
			delaySearch={ true }
			hideFocus
			initialValue={ filter.textSearch || null }
			isOpen={ false }
			onSearch={ handleSearchActivities }
			placeholder={ placeholder }
		/>
	);
};

export default TextSelector;

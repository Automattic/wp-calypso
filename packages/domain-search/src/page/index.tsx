import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEvent } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect } from 'react';
import { NamePulseResults } from '../name-pulse';
import { DomainSearchContext, useDomainSearchContextValue } from './context';
import { InitialState } from './initial-state';
import { ResultsPage } from './results';
import { type DomainSearchProps } from './types';

import './style.scss';

export { DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE } from './constants';
export type { SearchTrigger } from './types';

export const DomainSearch = ( props: DomainSearchProps ) => {
	const contextValue = useDomainSearchContextValue( props );

	const onPageView = useEvent( () => {
		contextValue.events.onPageView();
	} );

	useEffect( () => {
		onPageView();
	}, [ onPageView ] );

	// Mount only: later searches are reported by the action that starts them. Check for cached
	// data, not the fetch status, since the results page has already started any request by now.
	const onMountSearch = useEvent( () => {
		const { query, queries, events } = contextValue;

		if ( ! query ) {
			return;
		}

		const cachedSuggestions = queryClient.getQueryData(
			queries.domainSuggestions( query ).queryKey
		);
		events.onSearchStart( query, cachedSuggestions !== undefined ? 'cached' : 'prefilled' );
	} );

	useEffect( () => {
		onMountSearch();
	}, [ onMountSearch ] );

	const getContent = () => {
		if ( ! contextValue.query ) {
			return <InitialState />;
		}

		if ( contextValue.config.showNamePulseSearch ) {
			return <NamePulseResults />;
		}

		return <ResultsPage />;
	};

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider value={ contextValue }>
				<div className={ clsx( 'domain-search', props.className ) }>{ getContent() }</div>
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

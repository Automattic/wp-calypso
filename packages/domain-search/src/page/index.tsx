import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEvent } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect } from 'react';
import { DomainSearchContext, useDomainSearchContextValue } from './context';
import { InitialState } from './initial-state';
import { ResultsPage } from './results';
import { type DomainSearchProps } from './types';

import './style.scss';

export const DomainSearch = ( props: DomainSearchProps ) => {
	const contextValue = useDomainSearchContextValue( props );

	const onPageView = useEvent( () => {
		contextValue.events.onPageView();
	} );

	useEffect( () => {
		onPageView();
	}, [ onPageView ] );

	const getContent = () => {
		if ( ! contextValue.query ) {
			return <InitialState />;
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

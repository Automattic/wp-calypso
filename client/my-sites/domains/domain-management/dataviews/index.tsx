import { DomainsDataViews } from './domains-dataviews';
import { DomainsDataViewsProps } from './types';
import { useGenerateDomainsDataViewsState, DomainsDataViewsContext } from './use-context';

const DotcomDomainsDataViews = ( props: DomainsDataViewsProps ) => {
	const state = useGenerateDomainsDataViewsState( props );
	const { domains, isLoading, sidebarMode, selectedDomainName, queryParams } = props;
	return (
		<DomainsDataViewsContext.Provider value={ state }>
			<DomainsDataViews
				{ ...{ domains, isLoading, sidebarMode, selectedDomainName, queryParams } }
			/>
		</DomainsDataViewsContext.Provider>
	);
};

export default DotcomDomainsDataViews;

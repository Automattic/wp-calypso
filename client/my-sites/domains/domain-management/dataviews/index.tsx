import { DomainsDataViews } from './domains-dataviews';
import { DomainsDataViewsProps } from './types';
import { useGenerateDomainsDataViewsState, DomainsDataViewsContext } from './use-context';

const DotcomDomainsDataViews = ( props: DomainsDataViewsProps ) => {
	const state = useGenerateDomainsDataViewsState( props );
	return (
		<DomainsDataViewsContext.Provider value={ state }>
			<DomainsDataViews { ...props } />
		</DomainsDataViewsContext.Provider>
	);
};

export default DotcomDomainsDataViews;

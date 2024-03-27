import { useState } from 'react';
import { PluginPicker } from './plugin-picker';
import { SitePicker } from './site-picker';

export const MultiSitePluginPicker = () => {
	const [ selectedSites, setSelectedSites ] = useState< number[] >( [] );

	return (
		<div style={ { display: 'flex', gap: '20px' } }>
			<SitePicker selectedSites={ selectedSites } setSelectedSites={ setSelectedSites } />
			<PluginPicker selectedSites={ selectedSites } />
		</div>
	);
};

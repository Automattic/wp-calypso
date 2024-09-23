import { SearchControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { MultisitePluginUpdateManagerContext } from './context';

export const ScheduleListFilter = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useContext( MultisitePluginUpdateManagerContext );

	return (
		<div className="plugins-update-manager-multisite-filters">
			<div className="plugins-update-manager-multisite-filter">
				<SearchControl
					value={ searchTerm }
					placeholder={ translate( 'Search by site' ) }
					onChange={ handleSearch }
				/>
			</div>
		</div>
	);
};

import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { MultisitePluginUpdateManagerContext } from './context';

import './styles.scss';

export const ScheduleListFilter = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useContext( MultisitePluginUpdateManagerContext );

	return (
		<div className="plugins-update-manager-multisite-filter">
			<SearchInput
				placeholder={ translate( 'Search by site' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
				onSearchClose={ () => handleSearch( '' ) }
				defaultValue={ searchTerm }
			/>
		</div>
	);
};

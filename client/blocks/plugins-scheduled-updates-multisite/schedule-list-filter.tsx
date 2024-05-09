import SearchInput from '@automattic/search';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { MultisitePluginUpdateManagerContext } from './context';

const SearchSVG = (
	<svg
		className="plugins-update-manager-multisite-filter__search-icon"
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
			stroke="#8C8F94"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M17.5 17.5L13.875 13.875"
			stroke="#8C8F94"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
interface Props {
	compact?: boolean;
}

export const ScheduleListFilter = ( props: Props ) => {
	const translate = useTranslate();
	const { compact } = props;
	const { searchTerm, handleSearch } = useContext( MultisitePluginUpdateManagerContext );

	return (
		<div className="plugins-update-manager-multisite-filter">
			<SearchInput
				compact={ compact }
				placeholder={ translate( 'Search by site' ) }
				searchIcon={ <Icon icon={ SearchSVG } size={ 18 } /> }
				onSearch={ handleSearch }
				onSearchClose={ () => handleSearch( '' ) }
				defaultValue={ searchTerm }
			/>
		</div>
	);
};

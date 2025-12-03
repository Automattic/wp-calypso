import { useHelpSearchQuery } from '@automattic/help-center';
import {
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	Spinner,
} from '@wordpress/components';
import { getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

export default function SupportGuides() {
	const [ searchInput, setSearchInput ] = useState( '' );
	const { data: searchData, isFetching: isSearching } = useHelpSearchQuery(
		searchInput,
		getLocaleSlug() ?? 'en',
		'sectionName'
	);

	return (
		<VStack className="agenttic">
			<SearchControl onChange={ setSearchInput } />
			<ItemGroup isSeparated isBordered isRounded>
				{ isSearching && <Spinner /> }
				{ searchData?.map( ( item ) => (
					<Item key={ item.post_id }>
						<Link to={ `/post?link=${ item.link }` }>{ item.title }</Link>
					</Item>
				) ) }
			</ItemGroup>
		</VStack>
	);
}

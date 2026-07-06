import { agencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Switcher from '../../../components/switcher';
import { Text } from '../../../components/text';
import { getDisplayUrl, getSiteName } from '../dataviews/site-data';
import AgencySiteIcon from '../site-icon';
import type { SwitcherProps } from '../../../components/switcher';
import type { AgencySite } from '@automattic/api-core';

export type AgencySiteSwitcherProps = Pick< SwitcherProps< AgencySite >, 'renderToggle' > & {
	site: AgencySite;
};

const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: AgencySite } ) => getSiteName( item ),
	},
	{
		id: 'URL',
		getValue: ( { item }: { item: AgencySite } ) => getDisplayUrl( item ),
	},
];

export default function AgencySiteSwitcher( props: AgencySiteSwitcherProps ) {
	const { site, ...switcherProps } = props;
	const [ isOpen, setIsOpen ] = useState( false );
	const { data: sites } = useQuery( {
		...agencySitesQuery( { per_page: 100 } ),
		enabled: isOpen,
	} );

	return (
		<Switcher< AgencySite >
			{ ...switcherProps }
			renderItem={ ( { item, context } ) => (
				<Switcher.Item
					media={ <AgencySiteIcon site={ item } size={ context === 'list' ? 32 : 16 } /> }
					title={
						<Text weight={ 500 } truncate numberOfLines={ 1 } style={ { color: 'inherit' } }>
							{ getSiteName( item ) }
						</Text>
					}
					description={
						context === 'list' ? (
							<Text variant="muted" truncate numberOfLines={ 1 }>
								{ getDisplayUrl( item ) }
							</Text>
						) : undefined
					}
				/>
			) }
			items={ sites }
			value={ site }
			searchableFields={ searchableFields }
			getItemUrl={ ( item ) => `/sites/${ item.url }` }
			open={ isOpen }
			onToggle={ setIsOpen }
		/>
	);
}

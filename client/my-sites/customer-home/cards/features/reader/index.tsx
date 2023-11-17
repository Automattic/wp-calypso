import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import DiscoverNavigation from 'calypso/reader/discover/discover-navigation';
import { DEFAULT_TAB } from 'calypso/reader/discover/helper';
import Stream from 'calypso/reader/stream';

import './style.scss';

type TabType = string;

interface ReaderCardProps {
	width: number;
}

const ReaderCard = ( props: ReaderCardProps ) => {
	const locale = useLocale();
	const [ selectedTab, setSelectedTab ] = useState( DEFAULT_TAB );

	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	const handleTabChange = ( newTab: TabType ) => {
		setSelectedTab( newTab );
	};

	const streamKey = `discover:recommended--${ selectedTab }`;

	return (
		<div className="customer-home-reader-card">
			<DiscoverNavigation
				width={ props.width }
				selectedTab={ DEFAULT_TAB }
				recommendedTags={ interestTags }
				onTabChange={ handleTabChange }
			/>
			<Stream streamKey={ streamKey } trackScrollPage={ trackScrollPage.bind( null ) } />
		</div>
	);
};

export default withDimensions( ReaderCard );

import { translate } from 'i18n-calypso';
import { useState } from 'react';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';

import './style.scss';

type TableOption = {
	value: string;
	label: string;
};

// Meant to replace tables of stats-post-detail
export default function PostDetailTableSection( {
	siteId,
	postId,
}: {
	siteId: number;
	postId: number;
} ) {
	const [ tableKey, setTableKey ] = useState( 'years' );

	const tableOptions = [
		{ value: 'years', label: translate( 'Months and years' ) },
		{ value: 'averages', label: translate( 'Average per day' ) },
		{ value: 'weeks', label: translate( 'Recent Weeks' ) },
	];

	const toggleTable = ( option?: TableOption ) => {
		setTableKey( option?.value || 'years' );
	};

	return (
		<>
			<SimplifiedSegmentedControl
				className="stats-views__table-control"
				options={ tableOptions }
				onSelect={ toggleTable }
				compact
			/>

			{ [ 'years', 'averages' ].includes( tableKey ) ? (
				<PostMonths
					dataKey={ tableKey }
					title={ tableOptions.find( ( o ) => o.value === tableKey )?.label || 'Title' }
					total={ tableKey === 'years' ? translate( 'Total' ) : translate( 'Overall' ) }
					siteId={ siteId }
					postId={ postId }
				/>
			) : (
				<PostWeeks siteId={ siteId } postId={ postId } />
			) }
		</>
	);
}

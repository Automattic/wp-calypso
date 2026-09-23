import { __ } from '@wordpress/i18n';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import type { ActivityLogEntry } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

export const defaultView: View = {
	type: 'list',
	fields: [ 'date', 'content_text' ],
	mediaField: 'icon',
	titleField: 'title',
	perPage: 10,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	layout: {
		density: 'balanced',
	},
	showLevels: false,
};

export function BackupsList( {
	view,
	updateView,
	resetView,
	fields,
	filteredData,
	paginationInfo,
	selectedBackup,
	setSelectedBackup,
	isLoadingActivityLog,
}: {
	view: View;
	updateView: ( view: View ) => void;
	resetView?: () => void;
	fields: Field< ActivityLogEntry >[];
	filteredData: ActivityLogEntry[];
	paginationInfo: { totalItems: number; totalPages: number };
	selectedBackup: ActivityLogEntry | null;
	setSelectedBackup: ( backup: ActivityLogEntry | null ) => void;
	isLoadingActivityLog: boolean;
} ) {
	const onChangeSelection = ( selection: string[] ) => {
		const backup =
			selection.length > 0
				? filteredData.find( ( item ) => item.activity_id === selection[ 0 ] ) || null
				: null;
		setSelectedBackup( backup );
	};

	return (
		<DataViewsCard>
			<DataViews< ActivityLogEntry >
				getItemId={ ( item ) => item.activity_id }
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ updateView }
				onReset={ resetView }
				isLoading={ isLoadingActivityLog }
				defaultLayouts={ { list: {} } }
				paginationInfo={ paginationInfo }
				searchLabel={ __( 'Search backups' ) }
				onChangeSelection={ onChangeSelection }
				selection={ selectedBackup ? [ selectedBackup.activity_id ] : [] }
				empty={
					<p>
						{ view.search
							? __( 'No results for this search term' )
							: __( 'No results for this period' ) }
					</p>
				}
			/>
		</DataViewsCard>
	);
}

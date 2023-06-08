import { BackupLsResponse, FileBrowserItem } from './types';

export const parseBackupContentsData = ( payload: BackupLsResponse ): FileBrowserItem[] => {
	if ( ! payload || ! payload.contents || ! payload.ok ) {
		return [];
	}

	const transformedData = Object.entries( payload.contents ).map( ( [ name, item ] ) => {
		return {
			name,
			type: item.type,
			hasChildren: item.has_children ?? false,
			...( item.period && { period: item.period } ),
		};
	} );

	return transformedData.sort( ( a, b ) => {
		// Sort types (`dir` before `file`)
		if ( a.type < b.type ) {
			return -1;
		} else if ( a.type > b.type ) {
			return 1;
		}

		// If types are the same, sort by name
		return a.name.localeCompare( b.name );
	} );
};

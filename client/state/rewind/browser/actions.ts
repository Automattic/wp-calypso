import { Action } from 'redux';
import {
	JETPACK_BACKUP_BROWSER_ADD_CHILDREN,
	JETPACK_BACKUP_BROWSER_SET_CHECK_STATE,
} from 'calypso/state/action-types';

type BrowserAddChildrenActionType = Action< typeof JETPACK_BACKUP_BROWSER_ADD_CHILDREN > & {
	siteId: number;
	payload: {
		parentPath: string[] | string;
		childrenPaths: string[];
	};
};

type BrowserSetCheckStateActionType = Action< typeof JETPACK_BACKUP_BROWSER_SET_CHECK_STATE > & {
	siteId: number;
	payload: {
		nodePath: string[] | string;
		checkState: 'checked' | 'unchecked' | 'mixed';
	};
};

export const addChildNodes = (
	siteId: number,
	parentPath: string[] | string,
	childrenPaths: string[]
): BrowserAddChildrenActionType => ( {
	type: JETPACK_BACKUP_BROWSER_ADD_CHILDREN,
	siteId,
	payload: {
		parentPath,
		childrenPaths,
	},
} );

export const setNodeCheckState = (
	siteId: number,
	nodePath: string[] | string,
	checkState: 'checked' | 'unchecked' | 'mixed'
): BrowserSetCheckStateActionType => ( {
	type: JETPACK_BACKUP_BROWSER_SET_CHECK_STATE,
	siteId,
	payload: {
		nodePath,
		checkState,
	},
} );

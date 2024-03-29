import { ReactNode } from 'react';
import type { Context as PageContext } from '@automattic/calypso-router';
import type Redux from 'redux';

export interface Context extends PageContext {
	primary?: ReactNode;
	store: Redux.Store;
}

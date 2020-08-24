/**
 * External dependencies
 */
import { ReactNode } from 'react';
import type PageJS from 'page';
import type Redux from 'redux';

export interface Context extends PageJS.Context {
	primary?: ReactNode;
	store: Redux.Store;
}

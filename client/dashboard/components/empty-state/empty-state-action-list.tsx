import { ActionList } from '../action-list';
import type { ReactNode } from 'react';

type EmptyStateActionListProps = {
	children?: ReactNode;
};

export default function EmptyStateActionList( { children }: EmptyStateActionListProps ) {
	if ( ! children ) {
		return null;
	}

	return <ActionList>{ children }</ActionList>;
}

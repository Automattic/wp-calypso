import { ActionList } from '../action-list';
import type { ReactNode } from 'react';

type EmptyStateActionListProps = {
	children?: ReactNode;
};

export default function EmptyStateActionList( { children }: EmptyStateActionListProps ) {
	return <ActionList>{ children }</ActionList>;
}

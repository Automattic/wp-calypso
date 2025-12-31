import { ActionList } from '../action-list';
import type { ReactNode } from 'react';

type EmptyStateActionListProps = {
	isBorderless: boolean;
	children?: ReactNode;
};

export default function EmptyStateActionList( {
	children,
	isBorderless = false,
}: EmptyStateActionListProps ) {
	if ( ! children ) {
		return null;
	}

	return <ActionList isBorderless={ isBorderless }>{ children }</ActionList>;
}

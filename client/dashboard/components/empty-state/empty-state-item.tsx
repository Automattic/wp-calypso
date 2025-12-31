import { ActionList } from '../action-list';
import type { ActionItemProps } from '../action-list/types';

export default function EmptyStateItem( props: ActionItemProps ) {
	return <ActionList.ActionItem { ...props } />;
}

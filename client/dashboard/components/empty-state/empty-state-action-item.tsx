import { ActionList } from '../action-list';
import type { ActionItemProps } from '../action-list/types';

export default function EmptyStateActionItem( props: ActionItemProps ) {
	return <ActionList.ActionItem { ...props } />;
}

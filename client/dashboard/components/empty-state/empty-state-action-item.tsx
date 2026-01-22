import { useViewportMatch } from '@wordpress/compose';
import { ActionList } from '../action-list';
import type { ActionItemProps } from '../action-list/types';

export default function EmptyStateActionItem( props: ActionItemProps ) {
	const isMobile = useViewportMatch( 'mobile', '<' );

	if ( isMobile ) {
		return <ActionList.ActionItem { ...props } layout="stacked" />;
	}

	return <ActionList.ActionItem { ...props } />;
}

import { Reorder } from 'framer-motion';
import { CSSProperties, Ref } from 'react';

interface FramerMotionReorderListProps {
	forwardedRef?: Ref< HTMLDivElement >;
	className?: string;
	style?: CSSProperties;
	items: any[];
	onReorder: ( newOrder: any[] ) => void;
}

interface FramerMotionReorderListItemProps {
	item: any;
}

const FramerMotionReorderListItem = ( { item }: FramerMotionReorderListItemProps ) => {
	return (
		<Reorder.Item value={ item } style={ { originX: '0px', originY: '0px' } }>
			{ item }
		</Reorder.Item>
	);
};

const FramerMotionReorderList = ( {
	forwardedRef,
	className,
	style,
	items,
	onReorder,
}: FramerMotionReorderListProps ) => {
	const itemValues = items.map( ( item ) => item.key );

	return (
		<Reorder.Group
			ref={ forwardedRef }
			className={ className }
			style={ style }
			axis="y"
			values={ itemValues }
			layoutScroll
			onReorder={ onReorder }
		>
			{ items.map( ( item ) => (
				<FramerMotionReorderListItem key={ item.key } item={ item } />
			) ) }
		</Reorder.Group>
	);
};

export default FramerMotionReorderList;

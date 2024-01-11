import { Reorder } from 'framer-motion';
import { CSSProperties, Ref } from 'react';

interface FramerMotionReorderListItemProps {
	item: any;
	onReorderStart: () => void;
	onReorderEnd: () => void;
}

interface FramerMotionReorderListProps {
	forwardedRef?: Ref< HTMLDivElement >;
	className?: string;
	style?: CSSProperties;
	items: any[];
	onReorder: ( newOrder: any[] ) => void;
	onReorderStart: () => void;
	onReorderEnd: () => void;
}

const FramerMotionReorderListItem = ( {
	item,
	onReorderStart,
	onReorderEnd,
}: FramerMotionReorderListItemProps ) => {
	return (
		<Reorder.Item
			style={ { originX: '0px', originY: '0px', position: 'relative' } }
			value={ item.key }
			layout="position"
			onDragStart={ onReorderStart }
			onDragEnd={ onReorderEnd }
		>
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
	onReorderStart,
	onReorderEnd,
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
				<FramerMotionReorderListItem
					key={ item.key }
					item={ item }
					onReorderStart={ onReorderStart }
					onReorderEnd={ onReorderEnd }
				/>
			) ) }
		</Reorder.Group>
	);
};

export default FramerMotionReorderList;

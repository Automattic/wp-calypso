import { ClickableItemProps, MenuItemProps } from '../types';

export const NonClickableItem = ( { content, className }: MenuItemProps ) => {
	return (
		<button role="menuitem" className={ className }>
			{ content } <span className="x-nav-link-chevron" aria-hidden="true"></span>
		</button>
	);
};

export const ClickableItem = ( {
	titleValue,
	content,
	urlValue,
	className,
	type,
	typeClassName,
	target,
}: ClickableItemProps ) => {
	let liClassName = '';
	if ( type === 'menu' ) {
		liClassName = liClassName + ' x-menu-grid-item';
	}
	if ( className ) {
		liClassName = liClassName + ' ' + className;
	}
	return (
		<li className={ liClassName }>
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex={ -1 }
				target={ target }
			>
				{ content }
			</a>
		</li>
	);
};

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ClickableItemProps, MenuItemProps } from '../types';

export const NonClickableItem = ( { content, className }: MenuItemProps ) => {
	return (
		<button role="menuitem" className={ className }>
			{ content } <span className="x-nav-link-chevron" aria-hidden="true"></span>
		</button>
	);
};

const getParentElement = ( node: HTMLElement | null, pattern: RegExp ) => {
	let parent = node;
	while ( parent && ! parent.className.match( pattern ) ) {
		if ( parent === document.body ) {
			return null;
		}
		parent = parent.parentElement;
	}

	return parent;
};

const clickNavLinkEvent = ( target: HTMLElement ) => {
	const props: { [ key: string ]: string | number } = {};

	const container = getParentElement( target, /container/ );
	const section = getParentElement( target, /section/ );

	props.container_id = container?.id || '';
	props.container_class = container?.className || '';
	props.container = props.container_id || props.container_class || '';

	props.section_id = section?.id || '';
	props.section_class = section?.className || '';
	props.section = props.section_id || props.section_class || '';

	props.id = target.id || '';
	props.class = target.className || '';

	props.href = target.getAttribute( 'href' ) || '';
	props.target = target.getAttribute( 'target' ) || '';
	props.text = target.innerText || '';

	if ( typeof window !== 'undefined' && window.location ) {
		const currentPage = window.location.pathname || '';
		props.lp_name = currentPage.replace( /^\//, '' );
		props.path = props.lp_name;
	}

	recordTracksEvent( 'calypso_link_click', props );
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

	const onClick = ( event: React.MouseEvent< HTMLElement > ) => {
		const target = event.currentTarget;
		clickNavLinkEvent( target );
	};
	return (
		<li className={ liClassName }>
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex={ -1 }
				target={ target }
				onClick={ onClick }
			>
				{ content }
			</a>
		</li>
	);
};

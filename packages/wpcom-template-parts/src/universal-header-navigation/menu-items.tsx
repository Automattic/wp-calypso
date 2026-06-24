import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ClickableItemProps, MenuItemProps } from '../types';
import { recordNavLinkClick } from './nav-2026/tracks';

export const NonClickableItem = ( {
	content,
	className,
	ariaExpanded,
	ariaControls,
}: MenuItemProps ) => {
	return (
		<button
			type="button"
			role="menuitem"
			className={ className }
			// Advertise a popup only where we report its state — i.e. the 2026 triggers.
			aria-haspopup={ ariaExpanded !== undefined ? true : undefined }
			aria-expanded={ ariaExpanded }
			aria-controls={ ariaControls }
		>
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

const clickNavLinkEvent = ( target: HTMLElement, trackingText?: string ) => {
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
	props.text = trackingText || target.innerText || '';

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
	tabIndex,
	index,
	trackingText,
	onItemMouseEnter,
	onItemFocus,
}: ClickableItemProps ) => {
	let liClassName = '';
	if ( type === 'menu' ) {
		liClassName = liClassName + ' x-menu-grid-item';
	}
	if ( className ) {
		liClassName = liClassName + ' ' + className;
	}

	const onClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		const target = event.currentTarget;
		clickNavLinkEvent( target, trackingText );
		// Also emit the global-nav usage event; it resolves its props from the DOM
		// so it reports correctly on either nav.
		recordNavLinkClick( target );
	};
	return (
		<li
			className={ liClassName }
			role="none"
			onMouseEnter={ onItemMouseEnter }
			style={
				index !== undefined ? ( { '--stagger-index': index } as React.CSSProperties ) : undefined
			}
		>
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				target={ target }
				onClick={ onClick }
				onFocus={ onItemFocus }
				tabIndex={ tabIndex }
			>
				{ content }
			</a>
		</li>
	);
};

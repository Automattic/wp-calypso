import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useState } from 'react';
import { ClickableItemProps, MenuItemProps } from '../types';

export const NonClickableItem = ( { content, className }: MenuItemProps ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleFocus = () => {
		const dropdown = document.querySelector( `[data-dropdown-name="${ content }"]` );
		if ( dropdown instanceof HTMLElement ) {
			dropdown.setAttribute( 'aria-hidden', 'false' );
			setIsOpen( true );
		}
	};

	const handleBlur = ( event: React.FocusEvent< HTMLButtonElement > ) => {
		// Only close if focus is moving outside the dropdown
		if ( ! event.currentTarget.parentElement?.contains( event.relatedTarget as Node ) ) {
			const dropdown = document.querySelector( `[data-dropdown-name="${ content }"]` );
			if ( dropdown instanceof HTMLElement ) {
				dropdown.setAttribute( 'aria-hidden', 'true' );
				setIsOpen( false );
			}
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			setIsOpen( ! isOpen );
			const dropdown = document.querySelector( `[data-dropdown-name="${ content }"]` );
			if ( dropdown instanceof HTMLElement ) {
				dropdown.setAttribute( 'aria-hidden', isOpen ? 'true' : 'false' );
			}
		}
	};

	return (
		<button
			role="menuitem"
			className={ `x-nav-link x-link ${ className || '' }` }
			aria-haspopup="true"
			aria-expanded={ isOpen }
			data-dropdown-trigger={ content }
			tabIndex={ 0 }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			onKeyDown={ handleKeyDown }
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
		<li className={ liClassName } role="none">
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex={ type === 'nav' ? 0 : -1 }
				target={ target }
				onClick={ onClick }
			>
				{ content }
			</a>
		</li>
	);
};

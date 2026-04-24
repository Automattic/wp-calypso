import type { PageSummaryMetadata } from './tools/shared';

interface PageElementSummary {
	kind: 'interactive' | 'heading' | 'list_item';
	tag: string;
	role: string;
	text: string;
	label: string;
	type?: string;
	placeholder?: string;
	value?: string;
	checked?: boolean;
	disabled?: boolean;
	href?: string;
	coordinates: {
		left: number;
		top: number;
		width: number;
		height: number;
		center_x: number;
		center_y: number;
	};
}

interface PageSummaryNode {
	kind: PageElementSummary[ 'kind' ] | 'container';
	tag: string;
	role: string;
	text: string;
	label: string;
	type?: string;
	placeholder?: string;
	value?: string;
	checked?: boolean;
	disabled?: boolean;
	href?: string;
	coordinates: PageElementSummary[ 'coordinates' ];
	children: PageSummaryNode[];
}

interface PageSummaryPayload {
	page: {
		title: string;
		url: string;
		viewport: {
			width: number;
			height: number;
		};
		scroll: {
			x: number;
			y: number;
		};
		active_element: null | {
			tag: string;
			role: string;
			label: string;
			text: string;
		};
	};
	counts: {
		interactive_elements: number;
		headings: number;
		list_items: number;
	};
	structure: PageSummaryNode[];
	interactive_elements: PageElementSummary[];
	headings: PageElementSummary[];
	list_items: PageElementSummary[];
}

const INTERACTIVE_SELECTOR = [
	'button',
	'input',
	'select',
	'textarea',
	'a[href]',
	'summary',
	'[role="button"]',
	'[role="link"]',
	'[role="checkbox"]',
	'[role="radio"]',
	'[role="switch"]',
	'[role="tab"]',
	'[contenteditable="true"]',
].join( ', ' );

export function buildPageSummary(): { metadata: PageSummaryMetadata; text: string } {
	const metadata: PageSummaryMetadata = {
		viewportWidth: window.innerWidth,
		viewportHeight: window.innerHeight,
		scrollX: window.scrollX,
		scrollY: window.scrollY,
	};

	const interactiveElementNodes = collectElements(
		Array.from( document.querySelectorAll( INTERACTIVE_SELECTOR ) )
	);
	const headingElementNodes = collectElements(
		Array.from( document.querySelectorAll( 'h1, h2, h3, h4, h5, h6' ) )
	);
	const listItemElementNodes = collectElements(
		Array.from( document.querySelectorAll( 'li, [role="listitem"]' ) )
	);

	const interactiveElements = interactiveElementNodes
		.map( ( element ) => summarizeElement( element, 'interactive' ) )
		.filter( Boolean ) as PageElementSummary[];
	const headingElements = headingElementNodes
		.map( ( element ) => summarizeElement( element, 'heading' ) )
		.filter( Boolean ) as PageElementSummary[];
	const listItemElements = listItemElementNodes
		.map( ( element ) => summarizeElement( element, 'list_item' ) )
		.filter( Boolean ) as PageElementSummary[];
	const structuredNodes = buildStructuredTree( [
		...interactiveElementNodes.map( ( element ) => ( { element, kind: 'interactive' as const } ) ),
		...headingElementNodes.map( ( element ) => ( { element, kind: 'heading' as const } ) ),
		...listItemElementNodes.map( ( element ) => ( { element, kind: 'list_item' as const } ) ),
	] );

	const activeElement =
		document.activeElement instanceof HTMLElement && isVisibleForSummary( document.activeElement )
			? {
					tag: document.activeElement.tagName.toLowerCase(),
					role:
						document.activeElement.getAttribute( 'role' ) ??
						defaultRoleForElement( document.activeElement ),
					label: getElementLabel( document.activeElement ),
					text: normalizeText( document.activeElement.textContent ),
			  }
			: null;

	const payload: PageSummaryPayload = {
		page: {
			title: document.title,
			url: window.location.href,
			viewport: {
				width: metadata.viewportWidth,
				height: metadata.viewportHeight,
			},
			scroll: {
				x: metadata.scrollX,
				y: metadata.scrollY,
			},
			active_element: activeElement,
		},
		counts: {
			interactive_elements: interactiveElements.length,
			headings: headingElements.length,
			list_items: listItemElements.length,
		},
		structure: structuredNodes,
		interactive_elements: interactiveElements,
		headings: headingElements,
		list_items: listItemElements,
	};

	return {
		metadata,
		text:
			'Current page summary. All coordinates are viewport pixels from the current page state. ' +
			JSON.stringify( payload ),
	};
}

function collectElements( elements: Element[] ): HTMLElement[] {
	const seen = new Set< HTMLElement >();

	return elements.filter( ( element ): element is HTMLElement => {
		if ( ! ( element instanceof HTMLElement ) || seen.has( element ) ) {
			return false;
		}
		seen.add( element );
		return isVisibleForSummary( element );
	} );
}

function buildStructuredTree(
	relevantItems: Array< { element: HTMLElement; kind: PageElementSummary[ 'kind' ] } >
): PageSummaryNode[] {
	const relevantElements = new Map< HTMLElement, PageElementSummary[ 'kind' ] >();

	for ( const item of relevantItems ) {
		relevantElements.set( item.element, item.kind );
	}

	const includedElements = new Set< HTMLElement >();
	for ( const element of relevantElements.keys() ) {
		let current: HTMLElement | null = element;
		while ( current && current !== document.body ) {
			includedElements.add( current );
			current = current.parentElement;
		}
	}

	return Array.from( document.body.children ).flatMap( ( child ) =>
		serializeNodeTree( child as HTMLElement, relevantElements, includedElements )
	);
}

function serializeNodeTree(
	element: HTMLElement,
	relevantElements: Map< HTMLElement, PageElementSummary >,
	includedElements: Set< HTMLElement >
): PageSummaryNode[] {
	if ( ! includedElements.has( element ) || ! isVisibleForSummary( element ) ) {
		return [];
	}

	const children = Array.from( element.children ).flatMap( ( child ) =>
		serializeNodeTree( child as HTMLElement, relevantElements, includedElements )
	);
	const relevantKind = relevantElements.get( element );

	if ( relevantKind ) {
		const summary = summarizeElement(
			element,
			relevantKind as unknown as PageElementSummary[ 'kind' ]
		);
		if ( ! summary ) {
			return children;
		}
		return [
			{
				...summary,
				children,
			},
		];
	}

	if ( ! shouldKeepContainerNode( element, children ) ) {
		return children;
	}

	return [
		{
			kind: 'container',
			tag: element.tagName.toLowerCase(),
			role: element.getAttribute( 'role' ) ?? defaultRoleForElement( element ),
			text: getContainerText( element ),
			label: getElementLabel( element ),
			coordinates: getCoordinates( element ),
			children,
		},
	];
}

function summarizeElement(
	element: HTMLElement,
	kind: PageElementSummary[ 'kind' ]
): PageElementSummary | null {
	const coordinates = getCoordinates( element );
	if ( coordinates.width <= 0 || coordinates.height <= 0 ) {
		return null;
	}

	const input = element instanceof HTMLInputElement ? element : null;
	const select = element instanceof HTMLSelectElement ? element : null;
	const textarea = element instanceof HTMLTextAreaElement ? element : null;

	return {
		kind,
		tag: element.tagName.toLowerCase(),
		role: element.getAttribute( 'role' ) ?? defaultRoleForElement( element ),
		text: normalizeText( element.textContent ),
		label: getElementLabel( element ),
		type: input?.type,
		placeholder: input?.placeholder ?? textarea?.placeholder ?? '',
		value: getSafeValue( input, select, textarea ),
		checked: input?.type === 'checkbox' || input?.type === 'radio' ? input.checked : undefined,
		disabled:
			input?.disabled ??
			select?.disabled ??
			textarea?.disabled ??
			( 'disabled' in element ? Boolean( ( element as HTMLButtonElement ).disabled ) : false ),
		href: element instanceof HTMLAnchorElement ? element.href : undefined,
		coordinates,
	};
}

function isVisibleForSummary( element: HTMLElement ) {
	const rect = element.getBoundingClientRect();
	if ( rect.width <= 0 || rect.height <= 0 ) {
		return false;
	}

	const style = window.getComputedStyle( element );
	if (
		style.display === 'none' ||
		style.visibility === 'hidden' ||
		Number.parseFloat( style.opacity || '1' ) === 0
	) {
		return false;
	}

	return ! (
		rect.bottom < 0 ||
		rect.right < 0 ||
		rect.top > window.innerHeight ||
		rect.left > window.innerWidth
	);
}

function getElementLabel( element: HTMLElement ) {
	const ariaLabel = normalizeText( element.getAttribute( 'aria-label' ) || '' );
	if ( ariaLabel ) {
		return ariaLabel;
	}

	const labelledBy = normalizeText(
		( element.getAttribute( 'aria-labelledby' ) || '' )
			.split( /\s+/ )
			.filter( Boolean )
			.map( ( id ) => document.getElementById( id )?.textContent || '' )
			.join( ' ' )
	);
	if ( labelledBy ) {
		return labelledBy;
	}

	if (
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement
	) {
		if ( element.labels?.length ) {
			return normalizeText(
				Array.from( element.labels )
					.map( ( label ) => label.textContent || '' )
					.join( ' ' )
			);
		}
	}

	const closestLabel = element.closest( 'label' );
	if ( closestLabel ) {
		return normalizeText( closestLabel.textContent );
	}

	const placeholder =
		element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
			? normalizeText( element.placeholder )
			: '';
	if ( placeholder ) {
		return placeholder;
	}

	return normalizeText( element.textContent );
}

function defaultRoleForElement( element: HTMLElement ) {
	switch ( element.tagName.toLowerCase() ) {
		case 'a':
			return 'link';
		case 'button':
			return 'button';
		case 'input':
			return ( element as HTMLInputElement ).type || 'input';
		case 'select':
			return 'select';
		case 'textarea':
			return 'textbox';
		case 'li':
			return 'listitem';
		default:
			return '';
	}
}

function shouldKeepContainerNode( element: HTMLElement, children: PageSummaryNode[] ) {
	if ( children.length === 0 ) {
		return false;
	}

	if ( children.length > 1 ) {
		return true;
	}

	if (
		element.matches(
			'form, fieldset, section, article, main, nav, header, footer, aside, ul, ol, li, [role], [aria-label], [aria-labelledby]'
		)
	) {
		return true;
	}

	return Boolean( getContainerText( element ) );
}

function getContainerText( element: HTMLElement ) {
	const directText = Array.from( element.childNodes )
		.filter( ( node ) => node.nodeType === Node.TEXT_NODE )
		.map( ( node ) => node.textContent || '' )
		.join( ' ' );

	return normalizeText( directText || element.getAttribute( 'aria-label' ) || '' );
}

function getCoordinates( element: HTMLElement ): PageElementSummary[ 'coordinates' ] {
	const rect = element.getBoundingClientRect();

	return {
		left: round( rect.left ),
		top: round( rect.top ),
		width: round( rect.width ),
		height: round( rect.height ),
		center_x: round( rect.left + rect.width / 2 ),
		center_y: round( rect.top + rect.height / 2 ),
	};
}

function getSafeValue(
	input: HTMLInputElement | null,
	select: HTMLSelectElement | null,
	textarea: HTMLTextAreaElement | null
) {
	if ( input ) {
		if ( input.type === 'password' ) {
			return '';
		}
		if ( input.type === 'checkbox' || input.type === 'radio' ) {
			return '';
		}
		return normalizeText( input.value );
	}

	if ( select ) {
		return normalizeText( select.selectedOptions[ 0 ]?.textContent || '' );
	}

	if ( textarea ) {
		return normalizeText( textarea.value );
	}

	return '';
}

function normalizeText( text: string | null | undefined ) {
	return ( text || '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 160 );
}

function round( value: number ) {
	return Math.round( value * 10 ) / 10;
}

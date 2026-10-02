import { applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import type { McpUiHostContext } from '@modelcontextprotocol/ext-apps';

function pixels( value: number | undefined ): string {
	return value !== undefined && Number.isFinite( value ) && value >= 0 ? `${ value }px` : '';
}

export function createHostContextPresenter() {
	let previous: McpUiHostContext = {};
	return ( context?: McpUiHostContext ): McpUiHostContext => {
		const variables = context?.styles?.variables
			? { ...previous.styles?.variables, ...context.styles.variables }
			: previous.styles?.variables;
		previous = {
			...previous,
			...context,
			styles: {
				...previous.styles,
				...context?.styles,
				variables,
			},
		};
		const element = document.documentElement;
		const locale = previous.locale ?? 'en';
		const direction = previous.direction;
		element.lang = locale;
		if ( direction === 'ltr' || direction === 'rtl' ) {
			element.dir = direction;
		} else {
			element.dir = /^(ar|fa|he|ps|sd|ug|ur|yi)(?:-|$)|-(Arab|Hebr)(?:-|$)/i.test( locale )
				? 'rtl'
				: 'ltr';
		}
		applyDocumentTheme( previous.theme ?? 'light' );
		for ( const [ key, value ] of Object.entries( variables ?? {} ) ) {
			if ( value === undefined ) {
				element.style.removeProperty( key );
			}
		}
		if ( variables ) {
			applyHostStyleVariables( variables );
		}
		for ( const [ local, host ] of [
			[ '--agent-components-background', '--color-background-primary' ],
			[ '--agent-components-foreground', '--color-text-primary' ],
		] as const ) {
			if ( variables?.[ host ] !== undefined ) {
				element.style.setProperty( local, `var(${ host })` );
			} else {
				element.style.removeProperty( local );
			}
		}
		element.style.fontFamily = variables?.[ '--font-sans' ] ? 'var(--font-sans)' : '';
		element.style.fontSize = variables?.[ '--font-text-md-size' ] ? 'var(--font-text-md-size)' : '';
		element.style.lineHeight = variables?.[ '--font-text-md-line-height' ]
			? 'var(--font-text-md-line-height)'
			: '';
		const dimensions = previous.containerDimensions;
		element.style.maxWidth = pixels(
			dimensions && ( 'width' in dimensions ? dimensions.width : dimensions.maxWidth )
		);
		element.style.maxHeight = pixels(
			dimensions && ( 'height' in dimensions ? dimensions.height : dimensions.maxHeight )
		);
		element.style.overflowY = element.style.maxHeight ? 'auto' : '';
		return previous;
	};
}

export const applyHostContext = createHostContextPresenter();

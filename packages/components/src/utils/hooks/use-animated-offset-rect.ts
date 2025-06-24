import { useEvent } from '@wordpress/compose';
import { useLayoutEffect } from 'react';
import { useOnValueUpdate } from './use-on-value-update';
import type { ElementOffsetRect } from '../element-rect';

/**
 * A utility used to animate something in a container component based on the "offset
 * rect" (position relative to the container and size) of a subelement. For example,
 * this is useful to render an indicator for the selected option of a component, and
 * to animate it when the selected option changes.
 *
 * Takes in a container element and the up-to-date "offset rect" of the target
 * subelement, obtained with `useTrackElementOffsetRect`. Then it does the following:
 *
 * - Adds CSS variables with rect information to the container, so that the indicator
 *   can be rendered and animated with them. These are kept up-to-date, enabling CSS
 *   transitions on change.
 * - Sets an attribute (`data-subelement-animated` by default) when the tracked
 *   element changes, so that the target (e.g. the indicator) can be animated to its
 *   new size and position.
 * - Removes the attribute when the animation is done.
 *
 * The need for the attribute is due to the fact that the rect might update in
 * situations other than when the tracked element changes, e.g. the tracked element
 * might be resized. In such cases, there is no need to animate the indicator, and
 * the change in size or position of the indicator needs to be reflected immediately.
 */
export function useAnimatedOffsetRect(
	/**
	 * The container element.
	 */
	container: HTMLElement | undefined,
	/**
	 * The rect of the tracked element.
	 */
	rect: ElementOffsetRect,
	{
		prefix = 'subelement',
		dataAttribute = `${ prefix }-animated`,
		transitionEndFilter = () => true,
		roundRect = false,
	}: {
		/**
		 * The prefix used for the CSS variables, e.g. if `prefix` is `selected`, the
		 * CSS variables will be `--selected-top`, `--selected-left`, etc.
		 * @default 'subelement'
		 */
		prefix?: string;
		/**
		 * The name of the data attribute used to indicate that the animation is in
		 * progress. The `data-` prefix is added automatically.
		 *
		 * For example, if `dataAttribute` is `indicator-animated`, the attribute will
		 * be `data-indicator-animated`.
		 * @default `${ prefix }-animated`
		 */
		dataAttribute?: string;
		/**
		 * A function that is called with the transition event and returns a boolean
		 * indicating whether the animation should be stopped. The default is a function
		 * that always returns `true`.
		 *
		 * For example, if the animated element is the `::before` pseudo-element, the
		 * function can be written as `( event ) => event.pseudoElement === '::before'`.
		 * @default () => true
		 */
		transitionEndFilter?: ( event: TransitionEvent ) => boolean;
		/**
		 * Whether the `rect` measurements should be rounded down when applied
		 * to the CSS variables. This can be useful to avoid blurry animations or
		 * to avoid subpixel rendering issues.
		 * @default false
		 */
		roundRect?: boolean;
	} = {}
) {
	const setProperties = useEvent( () => {
		( Object.keys( rect ) as Array< keyof typeof rect > ).forEach(
			( property ) =>
				property !== 'element' &&
				container?.style.setProperty(
					`--${ prefix }-${ property }`,
					String( roundRect ? Math.floor( rect[ property ] ) : rect[ property ] )
				)
		);
	} );
	useLayoutEffect( () => {
		setProperties();
	}, [ rect, setProperties ] );
	useOnValueUpdate( rect.element, ( { previousValue } ) => {
		// Only enable the animation when moving from one element to another.
		if ( rect.element && previousValue ) {
			container?.setAttribute( `data-${ dataAttribute }`, '' );
		}
	} );
	useLayoutEffect( () => {
		function onTransitionEnd( event: TransitionEvent ) {
			if ( transitionEndFilter( event ) ) {
				container?.removeAttribute( `data-${ dataAttribute }` );
			}
		}
		container?.addEventListener( 'transitionend', onTransitionEnd );
		return () => container?.removeEventListener( 'transitionend', onTransitionEnd );
	}, [ dataAttribute, container, transitionEndFilter ] );
}

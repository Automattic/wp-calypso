import { Tooltip } from '@wordpress/components';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternTypeSwitcherOptionProps = React.PropsWithChildren< {
	onChange?( value: PatternTypeFilter ): void;
	toolTipText: string;
	value: PatternTypeFilter;
} >;

const PatternTypeSwitcherOption = ( {
	children,
	onChange,
	toolTipText,
	value,
}: PatternTypeSwitcherOptionProps ) => {
	const { category, isGridView, patternTypeFilter } = usePatternsContext();

	return (
		<Tooltip text={ toolTipText } { ...{ style: { maxWidth: '200px', top: '3px' } } }>
			<LocalizedLink
				className={ classNames(
					'pattern-library__toggle-option pattern-library__toggle-option--type',
					{ 'is-active': patternTypeFilter === value }
				) }
				href={ getCategoryUrlPath( category, value, false, isGridView ) }
				onClick={ () => {
					onChange?.( PatternTypeFilter.REGULAR );
				} }
				tabIndex={ -1 }
			>
				{ patternTypeFilter === value && (
					<motion.div
						className="pattern-library__toggle-backdrop"
						layoutId="pattern-type-switcher-shared-layout-id"
						role="presentation"
					/>
				) }

				<span>{ children }</span>
			</LocalizedLink>
		</Tooltip>
	);
};

type PatternTypeSwitcherProps = {
	onChange: PatternTypeSwitcherOptionProps[ 'onChange' ];
};

export function PatternTypeSwitcher( { onChange }: PatternTypeSwitcherProps ) {
	const translate = useTranslate();
	const ref = useRef< HTMLDivElement >( null );

	// React's built-in `onFocus` event handler captures bubbling focus events (i.e., it listens to
	// the `focusin` event). We don't want that, which is why we register a native `focus` event
	// listener
	useEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		const element = ref.current;

		function onFocus() {
			const link = element.querySelector< HTMLAnchorElement >(
				'.pattern-library__toggle-option.is-active'
			);
			link?.focus();
		}

		element.addEventListener( 'focus', onFocus );

		return () => {
			element.removeEventListener( 'focus', onFocus );
		};
	} );

	return (
		<motion.div
			className="pattern-library__toggle pattern-library__toggle--type"
			layout
			layoutRoot
			// Replicate the keyboard navigation behavior of `ToggleGroupControl`, where the options
			// within the control are focusable with the arrow keys
			onKeyDown={ ( event ) => {
				if ( ref.current?.contains( document.activeElement ) ) {
					let elementToFocus: Element | null = null;

					if ( event.key === 'ArrowLeft' ) {
						elementToFocus = document.activeElement?.previousElementSibling ?? null;
					} else if ( event.key === 'ArrowRight' ) {
						elementToFocus = document.activeElement?.nextElementSibling ?? null;
					}

					if ( elementToFocus instanceof HTMLElement ) {
						elementToFocus.focus();
					}
				}
			} }
			ref={ ref }
			tabIndex={ 0 }
		>
			<PatternTypeSwitcherOption
				onChange={ onChange }
				toolTipText={ translate( 'A collection of blocks that make up one section of a page', {
					comment: 'Tooltip text for displaying regular patterns within a Pattern Library category',
					textOnly: true,
				} ) }
				value={ PatternTypeFilter.REGULAR }
			>
				{ translate( 'Patterns', {
					comment: 'Refers to block patterns',
				} ) }
			</PatternTypeSwitcherOption>

			<PatternTypeSwitcherOption
				onChange={ onChange }
				toolTipText={ translate( 'A collection of patterns that form an entire page', {
					comment: 'Tooltip text for displaying page patterns within a Pattern Library category',
					textOnly: true,
				} ) }
				value={ PatternTypeFilter.PAGES }
			>
				{ translate( 'Page Layouts', {
					comment: 'Refers to block patterns that contain entire page layouts',
				} ) }
			</PatternTypeSwitcherOption>
		</motion.div>
	);
}

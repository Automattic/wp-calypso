import { Tooltip } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import classNames from 'classnames';
import { LayoutGroup, motion } from 'framer-motion';
import { useTranslate } from 'i18n-calypso';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

import './style.scss';

const FRAMER_LAYOUT_ID = 'pattern-type-switcher-shared-layout-id';

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
			>
				{ patternTypeFilter === value && (
					<motion.div layout layoutRoot>
						<motion.div
							className="pattern-library__toggle-backdrop"
							role="presentation"
							layoutId={ FRAMER_LAYOUT_ID }
						/>
					</motion.div>
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
	const baseId = useInstanceId( PatternTypeSwitcher, 'pattern-type-switcher' );

	return (
		<LayoutGroup id={ baseId }>
			<div className="pattern-library__toggle pattern-library__toggle--type">
				<PatternTypeSwitcherOption
					onChange={ onChange }
					toolTipText={ translate( 'A collection of blocks that make up one section of a page', {
						comment:
							'Tooltip text for displaying regular patterns within a Pattern Library category',
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
			</div>
		</LayoutGroup>
	);
}

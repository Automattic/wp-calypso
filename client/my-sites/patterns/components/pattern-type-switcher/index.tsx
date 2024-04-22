import page from '@automattic/calypso-router';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Tooltip,
} from '@wordpress/components';
import { ToggleGroupControlOptionProps } from '@wordpress/components/build-types/toggle-group-control/types';
import { useTranslate } from 'i18n-calypso';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

const ToggleGroupControlOptionWithNarrowTooltip = (
	props: ToggleGroupControlOptionProps & {
		className: string;
		showToolTip?: boolean;
		toolTipText: string;
	}
) => {
	const { showToolTip, toolTipText, ...toggleControlProps } = props;
	const toolTipProps = { style: { maxWidth: '200px', top: '3px' }, text: toolTipText };

	if ( ! showToolTip ) {
		return <ToggleGroupControlOption { ...toggleControlProps } />;
	}

	return (
		<Tooltip { ...toolTipProps }>
			<ToggleGroupControlOption { ...toggleControlProps } />
		</Tooltip>
	);
};

type PatternTypeSwitcherProps = {
	onChange?( value: PatternTypeFilter ): void;
};

export function PatternTypeSwitcher( { onChange }: PatternTypeSwitcherProps ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const { category, isGridView, patternTypeFilter } = usePatternsContext();

	return (
		<ToggleGroupControl
			className="pattern-library__toggle pattern-library__toggle--pattern-type"
			isBlock
			label=""
			onChange={ ( value ) => {
				onChange?.( value as PatternTypeFilter );
				const href =
					getCategoryUrlPath( category, value as PatternTypeFilter ) +
					( isGridView ? '?grid=1' : '' );
				page( href );
			} }
			value={ patternTypeFilter }
		>
			<ToggleGroupControlOptionWithNarrowTooltip
				className="pattern-library__toggle-option pattern-library__toggle-option--type"
				label={ translate( 'Patterns', {
					comment: 'Refers to block patterns',
					textOnly: true,
				} ) }
				showToolTip={ hasEnTranslation(
					'A collection of blocks that make up one section of a page'
				) }
				toolTipText={ translate( 'A collection of blocks that make up one section of a page' ) }
				value={ PatternTypeFilter.REGULAR }
			/>

			<ToggleGroupControlOptionWithNarrowTooltip
				className="pattern-library__toggle-option pattern-library__toggle-option--type"
				label={ translate( 'Page Layouts', {
					comment: 'Refers to block patterns that contain entire page layouts',
					textOnly: true,
				} ) }
				showToolTip={ hasEnTranslation( 'A collection of patterns that form an entire page' ) }
				toolTipText={ translate( 'A collection of patterns that form an entire page' ) }
				value={ PatternTypeFilter.PAGES }
			/>
		</ToggleGroupControl>
	);
}

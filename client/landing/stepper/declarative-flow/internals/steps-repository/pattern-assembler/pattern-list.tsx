import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useSite } from '../../../../hooks/use-site';
import Delayed from './delayed-render-hook';
import PatternPreviewAutoHeight from './pattern-preview-auto-height';
import { getPatternPreviewUrl, handleKeyboard } from './utils';
import type { Pattern } from './types';

interface Props {
	stylesheet: string;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternList = ( { stylesheet, patterns, selectedPattern, show, onSelect }: Props ) => {
	const locale = useLocale();
	const site = useSite();
	const [ firstPattern, ...restPatterns ] = patterns;

	const renderPatterns = ( patternList: Pattern[] ) =>
		patternList?.map( ( item: Pattern, index: number ) => (
			<PatternPreviewAutoHeight
				key={ `${ index }-${ item.id }` }
				url={ getPatternPreviewUrl( {
					id: item.id,
					language: locale,
					siteTitle: site?.name,
					stylesheet,
				} ) }
				patternId={ item.id }
				patternName={ item.name }
			>
				<div
					aria-label={ item.name }
					tabIndex={ show ? 0 : -1 }
					role="option"
					title={ item.name }
					aria-selected={ item.id === selectedPattern?.id }
					className={ classnames( {
						'pattern-selector__block-list--selected-pattern': item.id === selectedPattern?.id,
					} ) }
					onClick={ () => onSelect( item ) }
					onKeyUp={ handleKeyboard( () => onSelect( item ) ) }
				/>
			</PatternPreviewAutoHeight>
		) );

	return (
		<div className="pattern-selector__block-list" role="listbox">
			{ renderPatterns( [ firstPattern ] ) }
			<Delayed>
				<>{ renderPatterns( restPatterns ) }</>
			</Delayed>
		</div>
	);
};

export default PatternList;

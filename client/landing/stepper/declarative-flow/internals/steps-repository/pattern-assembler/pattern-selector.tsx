import { useLocale } from '@automattic/i18n-utils';
import PatternPreviewAutoHeight from './pattern-preview-auto-height';
import { getPatternPreviewUrl, handleKeyboard } from './utils';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[] | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	title: string | null;
	show: boolean;
};

const PatternSelector = ( { patterns, onSelect, title, show }: PatternSelectorProps ) => {
	const locale = useLocale();

	return (
		<div className="pattern-selector" style={ show ? {} : { height: 0, overflow: 'hidden' } }>
			<div className="pattern-selector__header">
				<h1>{ title }</h1>
			</div>
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					{ patterns?.map( ( item: Pattern, index: number ) => (
						<PatternPreviewAutoHeight
							key={ `${ index }-${ item.id }` }
							url={ getPatternPreviewUrl( item.id, locale ) }
							patternId={ item.id }
							patternName={ item.name }
						>
							<div
								aria-label={ item.name }
								tabIndex={ 0 }
								role="option"
								aria-selected={ false }
								onClick={ () => onSelect( item ) }
								onKeyUp={ handleKeyboard( () => onSelect( item ) ) }
							/>
						</PatternPreviewAutoHeight>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default PatternSelector;

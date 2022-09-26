import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useEffect, useRef } from 'react';
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
	const patternSelectorRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( show ) {
			patternSelectorRef.current?.focus();
			patternSelectorRef.current?.removeAttribute( 'tabindex' );
		}
	}, [ show ] );

	return (
		<div
			className={ classnames( 'pattern-selector', {
				'pattern-selector--active': show,
				'pattern-selector--hide': ! show,
			} ) }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={ show ? 0 : -1 }
			ref={ patternSelectorRef }
		>
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
								tabIndex={ show ? 0 : -1 }
								role="option"
								title={ item.name }
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

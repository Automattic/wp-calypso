import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	const patternSelectorRef = useRef( null );

	const handleBackClick = () => {
		onSelect( null );
	};

	useEffect( () => {
		show && patternSelectorRef.current?.focus();
		show && patternSelectorRef.current?.removeAttribute( 'tabindex' );
	}, [ show ] );

	return (
		<div
			className={ classnames( 'pattern-selector', {
				'pattern-selector--active': show,
			} ) }
			style={ show ? {} : { height: 0, overflow: 'hidden' } }
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

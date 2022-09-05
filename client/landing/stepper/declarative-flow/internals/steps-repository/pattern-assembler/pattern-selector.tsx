import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getPatternPreviewUrl, handleKeyboard } from './utils';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[] | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	title: string | null;
	show: boolean;
};

const PatternSelector = ( { patterns, onSelect, title, show }: PatternSelectorProps ) => {
	const translate = useTranslate();

	const handleBackClick = () => {
		onSelect( null );
	};

	return (
		<div className="pattern-selector" style={ show ? {} : { height: 0, overflow: 'hidden' } }>
			<div className="pattern-selector__header">
				<h1>{ title }</h1>
			</div>
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					{ patterns?.map( ( item: Pattern ) => (
						<div
							key={ item.id }
							aria-label={ item.name }
							tabIndex={ 0 }
							role="option"
							aria-selected={ false }
							onClick={ () => onSelect( item ) }
							onKeyUp={ handleKeyboard( () => onSelect( item ) ) }
						>
							<iframe
								title={ item.name }
								src={ getPatternPreviewUrl( item.id ) }
								frameBorder="0"
								aria-hidden
								tabIndex={ -1 }
							></iframe>
						</div>
					) ) }
				</div>
			</div>
			<div className="pattern-selector__footer">
				<Button className="pattern-assembler__button" onClick={ handleBackClick }>
					{ translate( 'Back' ) }
				</Button>
			</div>
		</div>
	);
};

export default PatternSelector;

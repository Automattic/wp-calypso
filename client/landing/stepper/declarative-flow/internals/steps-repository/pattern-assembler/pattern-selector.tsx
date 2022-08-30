import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { getPatternPreviewUrl, handleKeyboard } from './utils';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[] | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	title: string | null;
	show: boolean;
};

const PatternSelector = ( { patterns, onSelect, title, show }: PatternSelectorProps ) => {
	const [ selectedPattern, setSelectedPattern ] = useState< Pattern | null >( null );
	const translate = useTranslate();

	const handleContinueClick = () => {
		onSelect( selectedPattern );
	};

	const handleBackClick = () => {
		onSelect( null );
		setSelectedPattern( null );
	};

	const handleSelectedPattern = ( item: Pattern ) => {
		setSelectedPattern( item );
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
							onClick={ () => handleSelectedPattern( item ) }
							onKeyUp={ handleKeyboard( () => setSelectedPattern( item ) ) }
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
				{ selectedPattern && (
					<Button className="pattern-assembler__button" onClick={ handleContinueClick } primary>
						{ translate( 'Choose' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default PatternSelector;

import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import type { Pattern } from './types';

const patternPreviewUrl =
	'https://public-api.wordpress.com/wpcom/v2/block-previews/pattern?stylesheet=pub/blank-canvas&pattern_id=';

const sourceSiteId = 174455321; // dotcompatterns

const getPatternPreviewUrl = ( id: number ) => `${ patternPreviewUrl }${ id }-${ sourceSiteId }`;

type PatternsSelectorProps = {
	patterns: Pattern[] | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	title: string | null;
	pattern: Pattern | null;
};

const handleKeyboard =
	( callback ) =>
	( { key } ) => {
		if ( key === 'Enter' || key === ' ' ) callback();
	};

const PatternsSelector = ( { patterns, onSelect, title, pattern }: PatternsSelectorProps ) => {
	const [ selectedPattern, setSelectedPattern ] = useState( null );
	const translate = useTranslate();

	const handleContinueClick = () => {
		onSelect( selectedPattern );
	};

	const handleBackClick = () => {
		onSelect( null );
	};

	const isSelected = ( id ) => id === ( selectedPattern?.id || pattern?.id );

	return (
		<div className="patterns-selector">
			<div className="patterns-selector__header">
				<h1>{ title }</h1>
			</div>
			<div className="patterns-selector__body">
				<div className="patterns-selector__block-list" role="listbox">
					{ patterns.map( ( item: Pattern ) => (
						<div
							key={ item.id }
							aria-label={ item.name }
							tabIndex={ 0 }
							role="option"
							aria-selected={ isSelected( item.id ) }
							className={ classNames( { '--pattern-selected': isSelected( item.id ) } ) }
							onClick={ () => setSelectedPattern( item ) }
							onKeyUp={ handleKeyboard( () => setSelectedPattern( item ) ) }
						>
							<iframe
								title={ translate( item.name ) }
								src={ getPatternPreviewUrl( item.id ) }
								frameBorder="0"
								aria-hidden
								tabIndex={ -1 }
							></iframe>
						</div>
					) ) }
				</div>
			</div>
			<div className="patterns-selector__footer">
				<Button
					className="patterns-selector__button patterns-selector__button-back"
					onClick={ handleBackClick }
				>
					{ translate( 'Back' ) }
				</Button>
				{ selectedPattern && (
					<Button
						className="patterns-selector__button patterns-selector__button-continue"
						onClick={ handleContinueClick }
						primary
					>
						{ translate( 'Choose' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default PatternsSelector;

import { Button } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import PatternActionBar from './pattern-action-bar';
import type { Pattern } from './types';

type PatternHeaderItemProps = {
	header: Pattern | null;
	patternType: 'header';
	onSelectHeader: () => void;
	onDeleteHeader: () => void;
};

type PatternFooterItemProps = {
	footer: Pattern | null;
	patternType: 'footer';
	onSelectFooter: () => void;
	onDeleteFooter: () => void;
};

type PatternSectionItemProps = {
	section: Pattern | null;
	patternType: 'section';
	key: string;
	disableMoveUp: boolean;
	disableMoveDown: boolean;
	onSelectSection: () => void;
	onDeleteSection: () => void;
	onMoveUpSection: () => void;
	onMoveDownSection: () => void;
};

type PatternSectionsItemProps = {
	sections: Pattern[] | null;
	patternType: 'sections';
	onSelectSection: () => void;
};

type PatternListItemProps =
	| PatternHeaderItemProps
	| PatternFooterItemProps
	| PatternSectionItemProps
	| PatternSectionsItemProps;

const PatternListItem = ( props: PatternListItemProps ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const translate = useTranslate();

	const handleItemFocus = () => {
		setIsFocused( true );
	};

	const handleItemBlur = ( e: React.FocusEvent ) => {
		if ( ! e.currentTarget?.contains( e.relatedTarget ) ) {
			setIsFocused( false );
		}
	};

	let listItemContent = null;

	switch ( props.patternType ) {
		case 'header': {
			const { header, onSelectHeader, onDeleteHeader } = props;
			listItemContent = header ? (
				<li
					className={ classnames( 'pattern-layout__list-item pattern-layout__list-item--header', {
						'is-focused': isFocused,
					} ) }
					onFocus={ handleItemFocus }
					onBlur={ handleItemBlur }
				>
					<span className="pattern-layout__list-item-text" title={ header.name }>
						{ header.name }
					</span>
					<PatternActionBar onReplace={ onSelectHeader } onDelete={ onDeleteHeader } />
				</li>
			) : (
				<li className="pattern-layout__list-item pattern-layout__list-item--header">
					<Button onClick={ onSelectHeader }>
						<span className="pattern-layout__add-icon">+</span> { translate( 'Choose a header' ) }
					</Button>
				</li>
			);
			break;
		}
		case 'section': {
			const {
				section,
				key,
				disableMoveUp,
				disableMoveDown,
				onSelectSection,
				onDeleteSection,
				onMoveUpSection,
				onMoveDownSection,
			} = props;
			listItemContent = (
				<li
					key={ key }
					className={ classnames( 'pattern-layout__list-item pattern-layout__list-item--section', {
						'is-focused': isFocused,
					} ) }
					onFocus={ handleItemFocus }
					onBlur={ handleItemBlur }
				>
					<span className="pattern-layout__list-item-text" title={ section?.name }>
						{ section?.name }
					</span>
					<PatternActionBar
						onReplace={ onSelectSection }
						onDelete={ onDeleteSection }
						onMoveUp={ onMoveUpSection }
						onMoveDown={ onMoveDownSection }
						enableMoving={ true }
						disableMoveUp={ disableMoveUp }
						disableMoveDown={ disableMoveDown }
					/>
				</li>
			);
			break;
		}
		case 'sections': {
			const { sections, onSelectSection } = props;
			listItemContent = (
				<li className="pattern-layout__list-item pattern-layout__list-item--section">
					<Button onClick={ onSelectSection }>
						<span className="pattern-layout__add-icon">+</span>{ ' ' }
						{ sections?.length
							? translate( 'Add another section' )
							: translate( 'Add a first section' ) }
					</Button>
				</li>
			);
			break;
		}
		case 'footer': {
			const { footer, onSelectFooter, onDeleteFooter } = props;
			listItemContent = footer ? (
				<li
					className={ classnames( 'pattern-layout__list-item pattern-layout__list-item--footer', {
						'is-focused': isFocused,
					} ) }
					onFocus={ handleItemFocus }
					onBlur={ handleItemBlur }
				>
					<span className="pattern-layout__list-item-text" title={ footer.name }>
						{ footer.name }
					</span>
					<PatternActionBar onReplace={ onSelectFooter } onDelete={ onDeleteFooter } />
				</li>
			) : (
				<li className="pattern-layout__list-item pattern-layout__list-item--footer">
					<Button onClick={ onSelectFooter }>
						<span className="pattern-layout__add-icon">+</span> { translate( 'Choose a footer' ) }
					</Button>
				</li>
			);
			break;
		}
	}

	return listItemContent;
};

export default PatternListItem;

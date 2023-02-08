import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import { ONBOARD_STORE } from '../../../../stores';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern ) => void;
	onBack: () => void;
	onDoneClick: () => void;
	title: string | null;
	selectedPattern: Pattern | null;
};

const PatternSelector = ( {
	patterns,
	onSelect,
	onBack,
	onDoneClick,
	title,
	selectedPattern,
}: PatternSelectorProps ) => {
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const translate = useTranslate();
	const stylesheet = selectedDesign?.recipe?.stylesheet || '';
	const patternListProps = {
		placeholder: null,
		patterns,
		selectedPattern,
		activeClassName: 'pattern-selector__block-list--selected-pattern',
		onSelect,
	};

	return (
		<div className={ classnames( 'pattern-selector' ) }>
			<div className="pattern-selector__header">
				<Button borderless={ true } title={ translate( 'Back' ) } onClick={ onBack }>
					<Gridicon icon="chevron-left" size={ 16 } />
				</Button>
				<h1>{ title }</h1>
			</div>
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					{ isEnabled( 'pattern-assembler/client-side-render' ) ? (
						<AsyncLoad require="./pattern-list-renderer" { ...patternListProps } />
					) : (
						<AsyncLoad require="./pattern-list" { ...patternListProps } stylesheet={ stylesheet } />
					) }
				</div>
			</div>
			<div className="pattern-selector__footer">
				<Button className="pattern-assembler__button" onClick={ onDoneClick } primary>
					{ translate( 'Done' ) }
				</Button>
			</div>
		</div>
	);
};

export default PatternSelector;

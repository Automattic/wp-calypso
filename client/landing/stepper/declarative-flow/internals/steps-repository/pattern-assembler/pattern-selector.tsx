import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useAsyncList } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import { ONBOARD_STORE } from '../../../../stores';
import type { Pattern } from './types';

type PatternSelectorProps = {
	title?: string;
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern ) => void;
	onBack: () => void;
	onDoneClick: () => void;
	selectedPattern: Pattern | null;
	emptyPatternText?: string;
};

const PatternSelector = ( {
	title,
	patterns,
	onSelect,
	onBack,
	onDoneClick,
	selectedPattern,
	emptyPatternText,
}: PatternSelectorProps ) => {
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const translate = useTranslate();
	const stylesheet = selectedDesign?.recipe?.stylesheet || '';
	const shownPatterns = useAsyncList( patterns );
	const patternListProps = {
		placeholder: null,
		patterns,
		shownPatterns,
		selectedPattern,
		emptyPatternText,
		activeClassName: 'pattern-selector__block-list--selected-pattern',
		onSelect,
	};

	return (
		<div className="pattern-selector">
			{ title && (
				<div className="pattern-selector__header">
					<NavigatorBackButton
						as={ Button }
						title={ translate( 'Back' ) }
						borderless={ true }
						onClick={ onBack }
					>
						<Gridicon icon="chevron-left" size={ 16 } />
					</NavigatorBackButton>
					<h1>{ title }</h1>
				</div>
			) }
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
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ onDoneClick }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
		</div>
	);
};

export default PatternSelector;

import { Button, Gridicon } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useAsyncList } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import PatternListRenderer from './pattern-list-renderer';
import type { Pattern } from './types';

type PatternSelectorProps = {
	title?: string;
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
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
	const translate = useTranslate();
	const shownPatterns = useAsyncList( patterns );

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
					<PatternListRenderer
						patterns={ patterns }
						shownPatterns={ shownPatterns }
						selectedPattern={ selectedPattern }
						emptyPatternText={ emptyPatternText }
						activeClassName="pattern-selector__block-list--selected-pattern"
						onSelect={ onSelect }
					/>
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

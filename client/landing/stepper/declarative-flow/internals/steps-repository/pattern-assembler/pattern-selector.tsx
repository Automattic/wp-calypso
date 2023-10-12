import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useAsyncList } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import PatternListRenderer from './pattern-list-renderer';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	selectedPatterns?: Pattern[];
	isShowMorePatterns?: boolean;
	isNewSite: boolean;
};

const PatternSelector = ( {
	patterns = [],
	onSelect,
	selectedPattern,
	selectedPatterns,
	isShowMorePatterns,
	isNewSite,
}: PatternSelectorProps ) => {
	const translate = useTranslate();
	const shownPatterns = useAsyncList( patterns );
	const composite = useCompositeState( { orientation: 'vertical' } );

	return (
		<div className="pattern-selector">
			<div className="pattern-selector__body">
				<Composite
					{ ...composite }
					role="listbox"
					className="pattern-selector__block-list"
					aria-label={ translate( 'Block patterns' ) }
				>
					<PatternListRenderer
						patterns={ patterns }
						shownPatterns={ shownPatterns }
						selectedPattern={ selectedPattern }
						selectedPatterns={ selectedPatterns }
						activeClassName="pattern-selector__block-list--selected-pattern"
						composite={ composite }
						onSelect={ onSelect }
						isShowMorePatterns={ isShowMorePatterns }
						isNewSite={ isNewSite }
					/>
				</Composite>
			</div>
		</div>
	);
};

export default PatternSelector;

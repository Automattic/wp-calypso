import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useAsyncList } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternListRenderer from './pattern-list-renderer';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	emptyPatternText?: string;
	onDoneClick?: () => void;
	showDoneButton?: boolean;
	showHeader?: boolean;
};

const PatternSelector = ( {
	patterns,
	onSelect,
	selectedPattern,
	emptyPatternText,
	onDoneClick,
	showDoneButton,
	showHeader,
}: PatternSelectorProps ) => {
	const translate = useTranslate();
	const shownPatterns = useAsyncList( patterns );

	return (
		<div className="pattern-selector">
			{ ! isEnabled( 'pattern-assembler/categories' ) && showHeader && (
				<NavigatorHeader
					title={ selectedPattern ? translate( 'Replace pattern' ) : translate( 'Add patterns' ) }
				/>
			) }
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					<PatternListRenderer
						{ ...{
							patterns,
							shownPatterns,
							selectedPattern,
							emptyPatternText,
							activeClassName: 'pattern-selector__block-list--selected-pattern',
							onSelect,
						} }
					/>
				</div>
			</div>
			{ ! isEnabled( 'pattern-assembler/categories' ) && showDoneButton && (
				<div className="screen-container__footer">
					<NavigatorBackButton
						as={ Button }
						className="pattern-assembler__button"
						onClick={ onDoneClick }
						primary
					>
						{ translate( 'Done' ) }
					</NavigatorBackButton>
				</div>
			) }
		</div>
	);
};

export default PatternSelector;

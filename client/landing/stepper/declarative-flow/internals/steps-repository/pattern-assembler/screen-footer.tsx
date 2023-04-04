import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( type: string, selectedPattern: Pattern | null, selectedCategory: string ) => void;
	onBack: () => void;
	onDoneClick: () => void;
	updateActivePatternPosition: () => void;
	patterns: Pattern[];
}

const ScreenFooter = ( {
	selectedPattern,
	onSelect,
	onBack,
	onDoneClick,
	updateActivePatternPosition,
	patterns,
}: Props ) => {
	const translate = useTranslate();

	useEffect( () => {
		updateActivePatternPosition();
	}, [ updateActivePatternPosition ] );

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Footer' ) }
				description={ translate(
					'Your footer will be added to all pages and can be used to show information or links that will help visitors take the next step.'
				) }
				onBack={ onBack }
			/>
			<div className="screen-container__body">
				<PatternSelector
					patterns={ patterns }
					onSelect={ ( selectedPattern ) => onSelect( 'footer', selectedPattern, 'footer' ) }
					selectedPattern={ selectedPattern }
					emptyPatternText={ translate( 'No Footer' ) }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					primary
					onClick={ onDoneClick }
				>
					{ translate( 'Save' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenFooter;

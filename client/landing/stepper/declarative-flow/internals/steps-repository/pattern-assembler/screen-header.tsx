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

const ScreenHeader = ( {
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
				title={ translate( 'Header' ) }
				description={ translate(
					'Your header will be added to all pages and is usually where your site navigation lives.'
				) }
				onBack={ onBack }
			/>
			<div className="screen-container__body">
				<PatternSelector
					patterns={ patterns }
					onSelect={ ( selectedPattern ) => onSelect( 'header', selectedPattern, 'header' ) }
					selectedPattern={ selectedPattern }
					emptyPatternText={ translate( 'No Header' ) }
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

export default ScreenHeader;

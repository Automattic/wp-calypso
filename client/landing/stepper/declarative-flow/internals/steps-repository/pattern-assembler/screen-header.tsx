import { Button } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import NavigatorTitle from './navigator-title';
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
				title={ <NavigatorTitle title={ translate( 'Add header' ) } /> }
				description={ translate(
					'Pick the header that appears at the top of every page and shows your site logo, title and navigation.'
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
					{ translate( 'Save header' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenHeader;

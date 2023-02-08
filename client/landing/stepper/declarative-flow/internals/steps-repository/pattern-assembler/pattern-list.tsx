import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useSite } from '../../../../hooks/use-site';
import PatternPreviewAutoHeight from './pattern-preview-auto-height';
import { getPatternPreviewUrl } from './utils';
import type { Pattern } from './types';
import './pattern-list.scss';

interface Props {
	stylesheet: string;
	patterns: Pattern[];
	shownPatterns: Pattern[];
	selectedPattern: Pattern | null;
	activeClassName: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternList = ( {
	stylesheet,
	patterns,
	shownPatterns,
	selectedPattern,
	activeClassName,
	onSelect,
}: Props ) => {
	const locale = useLocale();
	const site = useSite();

	return (
		<>
			{ patterns?.map( ( pattern: Pattern, index: number ) => {
				const isShown = shownPatterns.includes( pattern );

				return isShown ? (
					<PatternPreviewAutoHeight
						key={ `${ index }-${ pattern.id }` }
						url={ getPatternPreviewUrl( {
							id: pattern.id,
							language: locale,
							siteTitle: site?.name,
							stylesheet,
						} ) }
						patternId={ pattern.id }
						patternName={ pattern.category }
					>
						<Button
							title={ pattern.category }
							className={ classnames( 'pattern-list__pattern', {
								[ activeClassName ]: pattern.id === selectedPattern?.id,
							} ) }
							onClick={ () => onSelect( pattern ) }
						/>
					</PatternPreviewAutoHeight>
				) : null;
			} ) }
		</>
	);
};

export default PatternList;

import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useSite } from '../../../../hooks/use-site';
import Delayed from './delayed-render-hook';
import PatternPreviewAutoHeight from './pattern-preview-auto-height';
import { getPatternPreviewUrl } from './utils';
import type { Pattern } from './types';
import './pattern-list.scss';

interface Props {
	stylesheet: string;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	activeClassName: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternList = ( {
	stylesheet,
	patterns,
	selectedPattern,
	show,
	activeClassName,
	onSelect,
}: Props ) => {
	const locale = useLocale();
	const site = useSite();
	const [ firstPattern, ...restPatterns ] = patterns;

	const renderPatterns = ( patternList: Pattern[] ) =>
		patternList?.map( ( pattern: Pattern, index: number ) => (
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
					tabIndex={ show ? 0 : -1 }
					title={ pattern.category }
					className={ classnames( 'pattern-list__pattern', {
						[ activeClassName ]: pattern.id === selectedPattern?.id,
					} ) }
					onClick={ () => onSelect( pattern ) }
				/>
			</PatternPreviewAutoHeight>
		) );

	return (
		<>
			{ renderPatterns( [ firstPattern ] ) }
			<Delayed>
				<>{ renderPatterns( restPatterns ) }</>
			</Delayed>
		</>
	);
};

export default PatternList;

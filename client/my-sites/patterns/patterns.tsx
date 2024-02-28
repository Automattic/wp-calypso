import {
	BlockRendererProvider,
	PatternsRendererProvider,
	PatternRenderer,
} from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { getPlaceholderSiteID } from '@automattic/data-stores/src/site/constants';
import { useLocale } from '@automattic/i18n-utils';
import { useResizeObserver } from '@wordpress/compose';
import classNames from 'classnames';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

import './style.scss';

const DESKTOP_VIEWPORT_WIDTH = 1200;

type PatternPreviewProps = {
	isGridView?: boolean;
	pattern: Pattern;
};

function PatternPreview( { isGridView, pattern }: PatternPreviewProps ) {
	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern.ID );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	return (
		<div
			className={ classNames( 'patterns__item', {
				patterns__item_loading: ! renderedPattern,
			} ) }
		>
			{ resizeObserver }

			<div className="patterns__preview">
				<PatternRenderer
					minHeight={ nodeSize.width ? nodeSize.width / ( 7 / 3 ) : undefined }
					patternId={ patternId }
					viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
				/>
			</div>

			<div className="patterns__title">{ pattern.title }</div>
		</div>
	);
}

type PatternPreviewPlaceholderProps = { pattern: Pattern };

function PatternPreviewPlaceholder( { pattern }: PatternPreviewPlaceholderProps ) {
	return (
		<div className="patterns__item patterns__item_loading">
			<div className="patterns__preview" />
			<div className="patterns__title">{ pattern.title }</div>
		</div>
	);
}

type PatternsProps = {
	category: string;
	isGridView?: boolean;
};

export default function Patterns( { category, isGridView }: PatternsProps ) {
	const locale = useLocale();
	const { data: patterns } = usePatterns( locale, category );
	const rendererSiteId = getPlaceholderSiteID();

	const patternIdsByCategory = {
		intro: patterns?.map( ( { ID } ) => `${ ID }` ) ?? [],
	};

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />
			<h1>Build your perfect site with patterns</h1>

			<BlockRendererProvider
				siteId={ rendererSiteId }
				placeholder={
					<div className="patterns">
						{ patterns?.map( ( pattern ) => (
							<PatternPreviewPlaceholder key={ pattern.ID } pattern={ pattern } />
						) ) }
					</div>
				}
			>
				<PatternsRendererProvider
					patternIdsByCategory={ patternIdsByCategory }
					shouldShufflePosts={ false }
					siteId={ rendererSiteId }
				>
					<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
						{ patterns?.map( ( pattern ) => (
							<PatternPreview isGridView={ isGridView } key={ pattern.ID } pattern={ pattern } />
						) ) }
					</div>
				</PatternsRendererProvider>
			</BlockRendererProvider>
		</Main>
	);
}

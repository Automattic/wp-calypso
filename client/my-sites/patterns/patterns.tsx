import {
	BlockRendererProvider,
	PatternsRendererProvider,
	PatternRenderer,
} from '@automattic/block-renderer';
import { getPlaceholderSiteID } from '@automattic/data-stores/src/site/constants';
import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';

import './style.scss';

type Props = {
	category: string;
	isGridView?: boolean;
};

export default function Patterns( { category, isGridView }: Props ) {
	const locale = useLocale();
	const { data: patterns } = usePatterns( locale, category );
	const rendererSiteId = getPlaceholderSiteID();

	const patternIdsByCategory = { intro: patterns?.map( ( { ID } ) => `${ ID }` ) ?? [] };

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />
			<h1>Build your perfect site with patterns</h1>

			<BlockRendererProvider siteId={ rendererSiteId }>
				<PatternsRendererProvider
					patternIdsByCategory={ patternIdsByCategory }
					shouldShufflePosts={ false }
					siteId={ rendererSiteId }
				>
					<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
						{ patterns?.map( ( pattern ) => (
							<div className="patterns__item" key={ pattern.ID }>
								<div className="patterns__preview">
									<PatternRenderer
										patternId={ encodePatternId( pattern.ID ) }
										viewportWidth={ isGridView ? 1200 : undefined }
									/>
								</div>

								<div className="patterns__title">{ pattern.title }</div>
							</div>
						) ) }
					</div>
				</PatternsRendererProvider>
			</BlockRendererProvider>
		</Main>
	);
}

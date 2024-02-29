import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview-placeholder';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';

import './style.scss';

type Props = {
	category: string;
	isGridView?: boolean;
};

export default function PatternsSSR( { category, isGridView }: Props ) {
	const locale = useLocale();
	const { data: patterns } = usePatterns( locale, category, {
		enabled: !! category,
	} );

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />

			<h1>Build your perfect site with patterns</h1>

			<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
				{ patterns?.map( ( pattern ) => (
					<PatternPreviewPlaceholder key={ pattern.ID } pattern={ pattern } />
				) ) }
			</div>
		</Main>
	);
}

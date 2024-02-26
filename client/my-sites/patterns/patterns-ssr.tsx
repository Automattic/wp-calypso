import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';

import './style.scss';

type Props = {
	category: string;
	isGridView?: boolean;
};

export default function PatternsSSR( { category, isGridView }: Props ) {
	const locale = useLocale();
	const { data: patterns } = usePatterns( locale, category );

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />

			<h1>Build your perfect site with patterns</h1>

			<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
				{ patterns?.map( ( pattern ) => (
					<div className="patterns__item patterns__item_loading" key={ pattern.ID }>
						<div className="patterns__preview">Loading…</div>
						<div className="patterns__title">{ pattern.title }</div>
					</div>
				) ) }
			</div>
		</Main>
	);
}

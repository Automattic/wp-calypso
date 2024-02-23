import { useLocale } from '@automattic/i18n-utils';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';

import './style.scss';

export default ( { category }: { category: string } ) => {
	const locale = useLocale();

	const { data: patterns } = usePatterns( locale, category );

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />

			<h1>Build your perfect site with patterns</h1>

			<ul className="patterns">
				{ patterns?.map( ( pattern ) => (
					<li key={ pattern.ID }>
						<iframe srcDoc={ pattern?.html } title={ pattern.title } />
					</li>
				) ) }
			</ul>
		</Main>
	);
};

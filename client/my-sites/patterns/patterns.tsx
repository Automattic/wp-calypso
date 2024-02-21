import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

import './style.scss';

export default ( { patterns }: { patterns: Pattern[] } ) => {
	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />

			<h1>Build your perfect site with patterns</h1>

			<ul className="patterns">
				{ patterns.map( ( pattern ) => (
					<li key={ pattern.ID }>
						<iframe srcDoc={ pattern?.html } title={ pattern.title } />
					</li>
				) ) }
			</ul>
		</Main>
	);
};

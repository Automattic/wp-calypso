import Main from 'calypso/components/main';
import useCategories from './use-categories';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

import './style.scss';

interface PatternsProps {
	isUserLoggedIn: boolean;
	patterns: Pattern[];
}

export default ( { isUserLoggedIn, patterns }: PatternsProps ) => {
	const categories = useCategories( patterns );

	return (
		<Main fullWidthLayout isLoggedOut>
			<div className="search-box-header">
				<h1 className="search-box-header__header">Build your perfect site with patterns</h1>

				<p className="search-box-header__subtitle">
					Hello { isUserLoggedIn ? 'logged-in' : 'logged-out' } users 👋
				</p>
			</div>

			<ul className="categories">
				{ categories.map( ( category ) => (
					<li key={ category.slug } title={ category.description }>
						{ category.title }
					</li>
				) ) }
			</ul>

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

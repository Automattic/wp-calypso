import { PatternsSearchField } from '../search-field';

import './style.scss';

type PatternsHeaderProps = {
	description: string;
	title: string;
};

export const PatternsHeader = ( { description, title }: PatternsHeaderProps ) => {
	return (
		<header className="patterns-header">
			<div className="patterns-header__inner">
				<h1>{ title }</h1>
				<div className="patterns-header__description">{ description }</div>
				<div className="patterns-header__search-input">
					<PatternsSearchField isCollapsible />
				</div>
			</div>
		</header>
	);
};

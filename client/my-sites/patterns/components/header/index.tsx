import Search from 'calypso/components/search';

import './style.scss';

type PatternsHeaderProps = {
	title: string;
	description: string;
};

export const PatternsHeader = ( { title, description }: PatternsHeaderProps ) => {
	return (
		<header className="patterns-header">
			<div className="patterns-header__inner">
				<h1>{ title }</h1>
				<div className="patterns-header__description">{ description }</div>
				<Search
					additionalClasses="patterns-header__search-input"
					placeholder="Search patterns..."
					onSearch={ () => {} }
				/>
			</div>
		</header>
	);
};

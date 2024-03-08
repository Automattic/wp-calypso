import Search from 'calypso/components/search';

import './style.scss';

type PatternsHeaderProps = {
	description: string;
	initialSearchTerm?: string;
	onSearch?( searchTerm: string ): void;
	title: string;
};

export const PatternsHeader = ( {
	description,
	initialSearchTerm = '',
	onSearch,
	title,
}: PatternsHeaderProps ) => {
	return (
		<header className="patterns-header">
			<div className="patterns-header__inner">
				<h1>{ title }</h1>
				<div className="patterns-header__description">{ description }</div>
				<Search
					additionalClasses="patterns-header__search-input"
					delaySearch
					initialValue={ initialSearchTerm }
					onSearch={ onSearch }
					placeholder="Search patterns..."
				/>
			</div>
		</header>
	);
};

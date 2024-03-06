import Search from 'calypso/components/search';

import './style.scss';

type Props = {
	description: string;
	onSearch?( searchTerm: string ): void;
	searchTerm?: string;
	title: string;
};

export const PatternsHeader = ( { description, onSearch, searchTerm = '', title }: Props ) => {
	return (
		<header className="patterns-header">
			<div className="patterns-header__inner">
				<h1>{ title }</h1>
				<div className="patterns-header__description">{ description }</div>
				<Search
					additionalClasses="patterns-header__search-input"
					delaySearch
					placeholder="Search patterns..."
					onSearch={ onSearch }
					value={ searchTerm }
				/>
			</div>
		</header>
	);
};

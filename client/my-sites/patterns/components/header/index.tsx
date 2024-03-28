import React from 'react';
import Search from 'calypso/components/search';

import './style.scss';

type PatternsHeaderProps = {
	description: string;
	searchValue?: string;
	onSearchKeyDown(
		event: React.KeyboardEvent< HTMLInputElement >,
		saveTmpValue: ( value: string ) => void
	): void;
	title: string;
};

export const PatternsHeader = ( {
	description,
	searchValue,
	onSearchKeyDown,
	title,
}: PatternsHeaderProps ) => {
	return (
		<header className="patterns-header">
			<div className="patterns-header__inner">
				<h1>{ title }</h1>
				<div className="patterns-header__description">{ description }</div>
				<Search
					additionalClasses="patterns-header__search-input"
					onSearch={ () => {} }
					initialValue={ searchValue }
					value={ searchValue }
					onKeyDown={ onSearchKeyDown }
					placeholder="Search patterns..."
				/>
			</div>
		</header>
	);
};

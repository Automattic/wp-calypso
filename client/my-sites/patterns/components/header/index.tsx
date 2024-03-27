import { useTranslate } from 'i18n-calypso';
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
	onSearch = () => {},
	title,
}: PatternsHeaderProps ) => {
	const translate_not_yet = useTranslate();
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
					placeholder={ translate_not_yet( 'Search patterns…' ) }
				/>
			</div>
		</header>
	);
};

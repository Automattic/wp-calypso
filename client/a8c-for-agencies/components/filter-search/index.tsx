import Search from 'calypso/components/search';

import './style.scss';

type Props = {
	label: string;
	onSearch: ( value: string ) => void;
	onClick?: () => void;
};

export default function FilterSearch( { onSearch, onClick, label }: Props ) {
	return (
		<div className="a4a-filter-search">
			<Search onClick={ onClick } onSearch={ onSearch } placeholder={ label } compact hideFocus />
		</div>
	);
}

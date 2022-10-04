import './header.scss';

const Header = ( {
	title,
	subtitle,
	count,
}: {
	title: string;
	subtitle: string;
	count: string;
} ) => {
	return (
		<div className="plugin-category-results-header">
			<h1 className="plugin-category-results-header__title">{ title }</h1>
			{ subtitle && <h2 className="plugin-category-results-header__subtitle">{ subtitle }</h2> }
			<div className="plugin-category-results-header__count">{ count }</div>
		</div>
	);
};

export default Header;

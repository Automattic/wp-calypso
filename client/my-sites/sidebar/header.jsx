export const MySitesSidebarUnifiedHeader = () => {
	return (
		<div className="sidebar__header">
			<a href="/sites" className="link-logo">
				<span className="logo"></span>
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<a href="#" className="link-search">
				<span className="search"></span>
			</a>
			<a href="#" className="link-help">
				<span className="help"></span>
			</a>
			<a href="#" className="link-notifications">
				<span className="bell"></span>
			</a>
		</div>
	);
};

export default MySitesSidebarUnifiedHeader;

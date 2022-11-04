const UniversalNavbarBtnMenuItem = ( { elementContent, className } ) => {
	return (
		<button role="menuitem" className={ className }>
			{ elementContent } <span className="x-nav-link-chevron" aria-hidden="true"></span>
		</button>
	);
};

export default UniversalNavbarBtnMenuItem;

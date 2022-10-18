const UniversalNavbarLiMenuItem = ( {
	titleValue,
	elementContent,
	urlValue,
	className,
	type,
	typeClassName,
} ) => {
	return (
		<li className={ className }>
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex="-1"
			>
				{ elementContent }
				<span className="x-menu-link-chevron" aria-hidden="true"></span>
			</a>
		</li>
	);
};

export default UniversalNavbarLiMenuItem;

const UniversalNavbarLiMenuItem = ( {
	titleValue,
	elementContent,
	urlValue,
	className,
	type,
	typeClassName,
} ) => {
	let liClassName = '';
	if ( type === 'menu' ) {
		liClassName = liClassName + ' x-menu-grid-item';
	}
	if ( className ) {
		liClassName = liClassName + ' ' + className;
	}
	return (
		<li className={ liClassName }>
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex="-1"
			>
				{ elementContent }
				{ /* <span className="x-menu-link-chevron" aria-hidden="true"></span> */ }
			</a>
		</li>
	);
};

export default UniversalNavbarLiMenuItem;

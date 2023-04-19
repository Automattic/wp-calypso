const SidebarHeading = ( { children, onClick, ...props } ) => {
	const tabIndex = onClick ? 0 : -1;

	let onKeyDown = null;

	if ( onClick ) {
		onKeyDown = ( event ) => {
			// Trigger click for enter, similarly to default brower behavior for <a> or <button>
			if ( 13 === event.keyCode ) {
				event.preventDefault();
				onClick();
			}
		};
	}

	const linkAttrs = { ...props };

	// These are not valid HTML attribute for a <a> tag
	delete linkAttrs.navigationLabel;
	delete linkAttrs.url;

	return (
		<li>
			{ /* eslint-disable jsx-a11y/no-static-element-interactions */ }
			<a
				tabIndex={ tabIndex }
				className="sidebar__heading"
				onKeyDown={ onKeyDown }
				onClick={ onClick }
				{ ...linkAttrs }
			>
				{ children }
			</a>
		</li>
	);
};

export default SidebarHeading;

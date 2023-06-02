function setMenuAttribute( menu, attr, enabled ) {
	if ( typeof menu[ attr ] !== 'undefined' && menu[ attr ] ) {
		menu.enabled = enabled;
	}
}

function setMenuItems( menu, attr, enabled ) {
	// Go through each menu item and if the attr is set then toggle the `enabled` flag
	for ( let main = 0; main < menu.items.length; main++ ) {
		const item = menu.items[ main ];

		setMenuAttribute( item, attr, enabled );

		if ( item.submenu ) {
			for ( let sub = 0; sub < item.submenu.items.length; sub++ ) {
				const subItem = item.submenu.items[ sub ];

				setMenuAttribute( subItem, attr, enabled );
			}
		}
	}
}

module.exports = {
	setRequiresUser: function ( menu, enabled ) {
		setMenuItems( menu, 'requiresUser', enabled );
	},

	setToggleFullScreen: function ( menu, enabled ) {
		setMenuItems( menu, 'fullscreen', enabled );
	},
};

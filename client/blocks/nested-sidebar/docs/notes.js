// Nested Sidebar notes

/*
	Each NestedSidebarLink would dispatch an action
	on click (setNestedSidebar),
	taking `parentRoute` and `sidebarRoute` and updating state.
	The new state might look like:

	nestedSidebar: {
		parentRoute: 'woo',
		sidebarRoute: 'products',
	}

	Then, there could be a connected component listening for changes
	and showing the correct sidebar content depending on `sidebarRoute`.
	The 'back' button in the sidebar would call `setNestedSidebar` with the `parentRoute`.
	The issue there is that it won't know how to replace `parentRoute` so that would be `null`,
	until the new component loads and sets this somehow.

	An alternative is to actually keep the navigation tree in the state itself (as in, a nested object)

	sidebar: {
		routes: {
			[ something ]: {
				routes: {
					[ somethingNested ]: {
						routes: {
							[ somethingFurtherNested ]: { ... },
						}
					}
				}
			},
			[ somethingElse ]: { ... }
		}
	}

	Though this might be an issue with deep linking as the tree is contextual,
	we'd need a way of building this context from anywhere in the tree.

*/

// Components

<NestedSidebarLink
	parentRoute="plugins"
	sidebarRoute="woo"
>
	<NestedSidebarLink
		parentRoute="woo"
		// if we were in a new component we could do:
		parentRoute={ this.props.sidebarRoute }
		component="?" // useful?
	/>
	<NestedSidebarLink
		parentRoute="woo"
		sidebarRoute="orders"
	/>
	<NestedSidebarLink
		parentRoute="plugins"
		sidebarRoute="summary"
	/>
</NestedSidebarLink>

// Actions

const setNestedSidebar = () =>


// Reducer

const getRoute = route =>
	find( sidebarRoutes<obj>, route, 'somethingDefault?' );

	// ...

const route = getRoute( action.sidebarRoute );
return route
	? {
		...route,
		sidebarRoute: route,
	}
	: state;


// Example routes object:
// 'Static' routes could be hard coded here
// but more dynamic sections could add their routes lazily.

const sidebarRoutes = {
	'plugins': {
		parent: null,
	},
	'woo': {
		parent: 'plugins',
	},
	'some-other-plugin': {
		parent: 'plugins',
	},
	'settings': {
		parent: null,
	}
}

const registerSidebarRoutes = routes => {
	sidebarRoutes = {
		sidebarRoutes,
		...routes,
	};

	return sidebarRoutes;
}

/*
	We could register a 'component' attribute to each of these routes.
	This would allow us to lazyload sections and avoid having to upfront all of the components
	in a massive, fixed, switch statement.
	This is less 'declaritive' but more scalable and maintainable.
*/
const sidebarRoutes = {
	'plugins': {
		parent: null,
		component: PluginsSidebar,
	},
	'settings': {
		parent: null,
		component: SettingsSidebar,
	},
	'domains': {
		parent: 'settings',
		component: DomainsSidebar,
	},
}

// In a controller or something similar...
registerSidebarRoutes( {
	route: 'woo',
	parent: 'plugins',
	component:  PluginsSidebar,
} );

registerSidebarRoutes( {
	route: 'some-other-plugin',
	parent: 'plugins',
	component:  SomeOtherPluginSidebar,
} );

// I think we'd then just need the render method of the sidebar to handle a few things...
// Some of the work in #20780 gets us close...
render: {
	const component = get( this.props, 'route.component' );
	const sidebarClasses = classNames( {
		'sub-sidebar-showing': isSubSidebarShowing,
	};

	return (
		<Sidebar className={ sidebarClasses }>
			<component .../>
		</Sidebar>
	);
}

// But instead of a concept of sidebar/sub-sidebar where it's one or the other,
// we need to have a dynamic of current-view, next-view and direction.
// I've done this a bunch in the past but not sure how the best practices look these days...
// Hopefully we have an already established pattern somewhere else in Calypso :)




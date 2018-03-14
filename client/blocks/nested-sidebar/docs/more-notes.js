

/*

I see there being 2 overarching approaches that we could take in allow people to declare their sidebars:

- Fully data defined:
	We allow for a json-like object (simple, serializable) to be 'registered' that defines how the sidebar content shoyld be structured.
	Each 'item' in the sidebar would be declared here with a given 'type' and extra params relevant to that type.
	Maybe that looks like this:
*/

{
	route: '/settings',
	items: [ {
		label: translate( 'Domains' ),
		type: 'sidebar-route',
		route: '/settings/domains',  // we might want to do something 'smart' by infering `/settings` from the parent.
									// This would limit us from linking between tree branches (could be a good thing though).
	}, {
		label: translate( 'Writing' ),
		type: 'content-link', // for want of a better name - this would act in the same way as
		url: '...',
	}, {
		label: translate( 'Some Settings Gap' ),
		type: 'external-link',
		url: '...',
	} ]
}

/*
	My worry is that these configuration items could become obtrusive.
	By trying to generalize too much we may end up having to stretch their definitions further and further...
	Right now, when looking at the current sidebar, they would each also need to be assigned an icon type.
		Some of them are also given an action button. The action button can't be standardised either
		unless we also pass down a callback.
		This can start looking quite cumbersome:
*/

{
	route: '/settings',
	items: [ {
		label: translate( 'Domains' ),
		type: 'sidebar-route',
		route: '/settings/domains',
		icon: 'globe',
		actionButtonLabel: translate( 'Add' ),
		actionButtonCallback: () => {
			// Potentially large body of logic that could have any number of side effects.
			// Regarding 3rd party plugins - we likely wouldn't allow such dynamic sidebar items
			// and instead limit those to be more simple.
		}
		// Potentially other config as the needs change...
	}, {
		label: translate( 'Writing' ),
		type: 'content-link',
		url: '...',
		icon: 'pen',
	}, {
		label: translate( 'Some Settings Gap' ),
		type: 'external-link',
		url: '...',
		icon: '?'
	} ]
}

/*
	The other option would be to just allow any component to slide in to the sidebar.
	We would define the component first, then
	This would allow us to keep our mappings very lean:
*/
const SettingsSidebarContent = () => (
	<SidebarContent className="settings-sidebar-content">
		<NestedSidebarRoute route="/settings/domains" >
			{ translate( 'Domains' ) }

			<SidebarAction ... >
				{ translate( 'Add' ) }
			</SidebarAction>
		</NestedSidebarRoute>
		<ExternalLink href="...">
			{ translate( 'Some Settings Gap' ) }
		</ExternalLink>
		{
			someLogicalCheckBasedOnProps && (
				<ExternalLink href="...">
					{ translate( 'Some Optional Settings Gap' ) }
				</ExternalLink>
			)
		}
	</SidebarContent>
);

// This would also allow us to connect to props, aiding dynamic sidebar states...
// (conditional rendering for example).
export default connect( state => ( { ... } ) )( SettingsSidebarContent );

// ...

import SettingsSidebarContent from 'components/settings-sidebar-content';
import DomainsSidebarContent from 'components/domains-sidebar-content';

registerSidebarContent( {
	route: '/settings',
	parent: 'root', // or just null?
	component: SettingsSidebarContent,
} )

registerSidebarContent( {
	route: '/settings/domains',
	parent: '/settings'
	component: DomainsSidebarContent,
} )

registerSidebarContent( {
	route: '/settings/domains/something-else',
	parent: '/settings/domains',
	component: SomeDeeperSidebarContent,
} )

/*
	It'd be good to be able to register these in bulk too, passing an array infers multiple, object infers single:
*/
registerSidebarContent( [
	{ route: '/settings', ... },
	{ route: '/settings/domains', ... },
 	{ route: '/settings/domains/something-else', ... },
] );




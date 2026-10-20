import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, TabsApi } from '@a2ui/web_core/v0_9';
import { TabPanel } from '@wordpress/components';
import { z } from 'zod';

export const Tabs = createComponentImplementation(
	{
		name: TabsApi.name,
		schema: TabsApi.schema.pick( { tabs: true } ).extend( {
			tabs: z
				.array(
					z.object( {
						title: z.union( [ z.string(), DataBindingSchema ] ),
						child: TabsApi.schema.shape.tabs.element.shape.child,
					} )
				)
				.min( 1 ),
		} ),
	},
	( { props, buildChild } ) => {
		const tabs = props.tabs.map( ( tab, index ) => ( {
			name: String( index ),
			title: typeof tab.title === 'string' ? tab.title : '',
		} ) );
		return (
			<TabPanel key={ JSON.stringify( props.tabs.map( ( tab ) => tab.child ) ) } tabs={ tabs }>
				{ ( selectedTab ) =>
					props.tabs.map( ( tab, index ) => (
						<div key={ index } hidden={ selectedTab.name !== String( index ) }>
							{ buildChild( tab.child ) }
						</div>
					) )
				}
			</TabPanel>
		);
	}
);

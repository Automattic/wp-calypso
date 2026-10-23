import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { TabPanel } from '@wordpress/components';
import { z } from 'zod';
import { StringValueSchema } from '../utils/schemas';

export const Tabs = createComponentImplementation(
	{
		name: 'Tabs',
		schema: z.object( {
			tabs: z
				.array(
					z.object( {
						title: StringValueSchema,
						child: ComponentIdSchema,
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

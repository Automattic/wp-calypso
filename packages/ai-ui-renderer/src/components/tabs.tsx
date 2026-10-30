import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Tabs as WordPressTabs } from '@wordpress/ui';
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
		return (
			<WordPressTabs.Root
				key={ JSON.stringify( props.tabs.map( ( tab ) => tab.child ) ) }
				defaultValue="0"
			>
				<WordPressTabs.List className="ai-ui-renderer__tabs" activateOnFocus>
					{ props.tabs.map( ( tab, index ) => (
						<WordPressTabs.Tab key={ index } value={ String( index ) }>
							{ typeof tab.title === 'string' ? tab.title : '' }
						</WordPressTabs.Tab>
					) ) }
				</WordPressTabs.List>
				{ props.tabs.map( ( tab, index ) => (
					<WordPressTabs.Panel key={ index } value={ String( index ) } keepMounted>
						{ buildChild( tab.child ) }
					</WordPressTabs.Panel>
				) ) }
			</WordPressTabs.Root>
		);
	}
);

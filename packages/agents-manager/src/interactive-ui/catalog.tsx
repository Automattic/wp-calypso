import { basicCatalog } from '@a2ui/react/v0_9';
import { Catalog, ColumnApi, DataBindingSchema, markChildRef, TextApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import Button from './button';
import TextField from './text-field';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );

const Text = {
	...basicCatalog.components.get( 'Text' )!,
	schema: TextApi.schema.pick( { text: true } ).extend( { text: dynamicString } ),
};
const Column = {
	...basicCatalog.components.get( 'Column' )!,
	schema: ColumnApi.schema.pick( { children: true } ).extend( {
		children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
	} ),
};
export const catalog = new Catalog(
	basicCatalog.id,
	'0.9',
	[ Text, TextField, Button, Column ],
	[],
	basicCatalog.themeSchema
);

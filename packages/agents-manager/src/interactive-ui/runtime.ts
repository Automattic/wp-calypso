import { basicCatalog } from '@a2ui/react/v0_9';
import { Catalog, MessageProcessor } from '@a2ui/web_core/v0_9';
import Button from './button';
import Card from './card';
import CheckBox from './check-box';
import ChoicePicker from './choice-picker';
import Column from './column';
import DateTimeInput from './date-time-input';
import Divider from './divider';
import Icon from './icon';
import Image from './image';
import List from './list';
import Row from './row';
import Text from './text';
import TextField from './text-field';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9';

const catalog = new Catalog(
	basicCatalog.id,
	'0.9',
	[
		Text,
		TextField,
		Button,
		Column,
		Image,
		Icon,
		Row,
		List,
		Card,
		Divider,
		CheckBox,
		ChoicePicker,
		DateTimeInput,
	],
	[],
	basicCatalog.themeSchema
);

export function createInteractiveUiRuntime(
	onAction: ( action: A2uiClientAction ) => Promise< void >
) {
	const processor = new MessageProcessor< ReactComponentImplementation >( [ catalog ], onAction );
	const placements = new Map< string, string >();
	let messageId = '';
	const created = processor.onSurfaceCreated( ( surface ) =>
		placements.set( surface.id, messageId )
	);
	const deleted = processor.onSurfaceDeleted( ( id ) => placements.delete( id ) );

	return {
		processMessages: ( messages: A2uiMessage[], ownerMessageId: string ) => {
			messageId = ownerMessageId;
			processor.processMessages( messages );
		},
		getSurface: ( id: string ) => processor.getSurface( id ),
		getSurfaceIds: ( ownerMessageId: string ) =>
			[ ...placements ].flatMap( ( [ id, owner ] ) => ( owner === ownerMessageId ? [ id ] : [] ) ),
		dispose: () => {
			created.unsubscribe();
			deleted.unsubscribe();
			processor.model.dispose();
			processor.dispose();
		},
	};
}

export type InteractiveUiRuntime = ReturnType< typeof createInteractiveUiRuntime >;

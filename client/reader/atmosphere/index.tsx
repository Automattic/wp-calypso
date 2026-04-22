import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { atmosphereController } from './controller';

export default function () {
	page(
		'/reader/atmosphere',
		sidebar,
		setBeforePrimary,
		atmosphereController,
		makeLayout,
		clientRender
	);
}

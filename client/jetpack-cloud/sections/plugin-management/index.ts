import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { pluginManagementContext } from './controller';

export default function (): void {
	page(
		'/plugins/:filter(manage|active|inactive|updates)?',
		pluginManagementContext,
		makeLayout,
		clientRender
	);
}

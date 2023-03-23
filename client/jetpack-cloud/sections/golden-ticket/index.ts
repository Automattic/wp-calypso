import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { goldenTicketContext } from './controller';

export default function (): void {
	page( '/golden-ticket', goldenTicketContext, makeLayout, clientRender );
}

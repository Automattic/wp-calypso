import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { agencyDashboardContext } from './controller';

export default function (): void {
	page( '/dashboard/:filter(favorites)?', agencyDashboardContext, makeLayout, clientRender );
}

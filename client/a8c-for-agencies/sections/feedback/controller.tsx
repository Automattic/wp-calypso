import { type Callback } from '@automattic/calypso-router';
import { A4AFeedback } from 'calypso/a8c-for-agencies/components/a4a-feedback';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';

export const feedbackContext: Callback = ( context, next ) => {
	context.primary = <A4AFeedback type={ context.query.type } />;
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

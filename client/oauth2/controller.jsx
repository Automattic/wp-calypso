import { recordPageView } from 'calypso/lib/analytics/page-view';
import Authorize from './components/authorize';
import './style.scss';

export function bootstrap( context, next ) {
	recordPageView( '/oauth2/authorize', 'OAuth2 client authorization' );
	context.primary = <Authorize />;
	next();
}

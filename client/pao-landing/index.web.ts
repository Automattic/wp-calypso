import { clientRouter, makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { paoLandingContext } from 'calypso/pao-landing/controller';

export default function ( router: typeof clientRouter ) {
	router( '/pao-landing/square-payments', paoLandingContext, makeLayout, clientRender );
}

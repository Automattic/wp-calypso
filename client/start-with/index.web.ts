import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { notFound, startWithSquarePaymentsContext } from 'calypso/start-with/controller';

export default function () {
	page( '/start-with/square-payments', startWithSquarePaymentsContext, makeLayout, clientRender );
	page( '/start-with*', notFound, makeLayout, clientRender );
}

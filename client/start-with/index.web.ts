import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	redirectToSquarePayments,
	startWithSquarePaymentsContext,
} from 'calypso/start-with/controller';

export default function () {
	page( '/start-with', redirectToSquarePayments );
	page( '/start-with/square-payments', startWithSquarePaymentsContext, makeLayout, clientRender );
}

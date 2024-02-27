import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { purchasesContext, licensesContext } from './controller';

export default function () {
	page( '/purchases', purchasesContext, makeLayout, clientRender );
	page( '/purchases/licenses', licensesContext, makeLayout, clientRender );
}

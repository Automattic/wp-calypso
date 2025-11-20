import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { A4A_CLIENT_EXPRESS_CHECKOUT } from '../../components/sidebar-menu/lib/constants';
import * as controller from './controller';

export default function () {
	page( A4A_CLIENT_EXPRESS_CHECKOUT, controller.clientExpressCheckout, makeLayout, clientRender );
}

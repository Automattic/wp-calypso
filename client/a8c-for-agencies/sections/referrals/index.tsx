import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { referralsContext } from './controller';

export default function () {
	page( '/referrals', referralsContext, makeLayout, clientRender );
}

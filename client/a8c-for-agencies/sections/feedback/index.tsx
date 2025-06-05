import page from '@automattic/calypso-router';
import { A4A_FEEDBACK_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { feedbackContext } from './controller';

export default function () {
	page( A4A_FEEDBACK_LINK, feedbackContext, makeLayout, clientRender );
}

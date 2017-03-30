/**
 * Internal dependencies
 */
import { verifyEmailForward } from './controller';
import { makeLayout } from 'controller';

export default ( router ) => {
	router(
		'/verify-email-forward/:domain_email_id/:mailbox_base64/:nonce/:locale?',
		verifyEmailForward,
		makeLayout
	);
};

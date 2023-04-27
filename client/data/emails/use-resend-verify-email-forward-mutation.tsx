import { useTranslate } from 'i18n-calypso';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import wp from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { EmailAccountEmail } from './types';
import type { UseMutationOptions } from 'react-query';

const MUTATION_KEY = 'reverifyEmailForward';

/**
 * Manually trigger a new verification email to an email forward receiver
 *
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useResendVerifyEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit< UseMutationOptions< any, unknown, EmailAccountEmail >, 'mutationFn' > = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const suppliedOnError = mutationOptions.onError;
	const suppliedOnSuccess = mutationOptions.onSuccess;

	mutationOptions.mutationKey = MUTATION_KEY;

	mutationOptions.onSuccess = ( data, emailForward, context ) => {
		suppliedOnSuccess?.( data, emailForward, context );

		const destination = getEmailForwardAddress( emailForward );

		const successMessage = translate(
			'Successfully sent confirmation email for %(email)s to %(destination)s.',
			{
				args: {
					email: emailForward.mailbox + '@' + domainName,
					destination,
				},
			}
		);

		dispatch(
			successNotice( successMessage, {
				duration: 7000,
			} )
		);
	};

	mutationOptions.onError = ( error, variables, context ) => {
		suppliedOnError?.( error, variables, context );

		const failureMessage = translate(
			'Failed to resend verification email for email forwarding record %(email)s. ' +
				'Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					email: variables.mailbox + '@' + domainName,
				},
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);

		dispatch( errorNotice( failureMessage ) );
	};

	return useMutation< any, unknown, EmailAccountEmail >(
		( { mailbox } ) =>
			wp.req.post(
				`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
					mailbox
				) }/resend-verification`
			),
		mutationOptions
	);
}

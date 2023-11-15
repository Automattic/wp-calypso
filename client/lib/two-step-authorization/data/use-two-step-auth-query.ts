import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import wp from 'calypso/lib/wp';

const TwoStepSchema = z.object( {
	two_step_authorization_expires_soon: z.boolean(),
	two_step_backup_codes_printed: z.boolean(),
	two_step_enabled: z.boolean(),
	two_step_reauthorization_required: z.boolean(),
	two_step_sms_enabled: z.boolean(),
	two_step_sms_last_four: z.string().or( z.boolean() ),
	two_step_webauthn_enabled: z.boolean(),
	two_step_webauthn_nonce: z.string().or( z.literal( false ) ),
} );

const queryFn = async () => {
	const response = await wp.req.get( '/me/two-step/' );
	return TwoStepSchema.parse( response );
};

export const useTwoStepAuthQuery = () => {
	const result = useQuery( {
		queryKey: [ 'two-step-auth' ],
		queryFn,
		select( data ) {
			return {
				isReauthRequired: data.two_step_reauthorization_required ?? false,
				isTwoStepSMSEnabled: data.two_step_sms_enabled ?? false,
				isSecurityKeyEnabled: data.two_step_webauthn_enabled ?? false,
				twoStepWebauthnNonce: data.two_step_webauthn_nonce ?? false,
				SMSLastFour: data.two_step_sms_last_four ?? null,
			};
		},
	} );

	return result;
};

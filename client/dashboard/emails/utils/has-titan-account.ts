import { EmailProvider } from '@automattic/api-core';
import type { EmailAccount } from '@automattic/api-core';

export const hasTitanAccount = ( accounts: EmailAccount[] | undefined ) =>
	( accounts ?? [] ).some( ( account ) => account.account_type === EmailProvider.Titan );

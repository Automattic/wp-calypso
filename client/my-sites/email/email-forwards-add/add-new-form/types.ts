import type { EmailAccountEmail } from 'calypso/data/emails/types';

export interface DestinationsInputProps {
	values: string[];
	onChange: ( values: string[] ) => void;
	selectedDomainName: string;
	disabled: boolean;
	existingForwardsForMailbox: EmailAccountEmail[];
	mailbox: string;
}

export interface SourceInputProps {
	suffix: string;
	disabled: boolean;
	onChange: ( value: string ) => void;
	value: string;
}

export type ValidationError = { severity: 'warning' | 'error'; message: string };
export interface NewForwardFormProps {
	selectedDomainName: string;
	existingEmailForwards: EmailAccountEmail[];
	disabled: boolean;
}

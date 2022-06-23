import { useRtl } from 'i18n-calypso';
import { PropsWithChildren } from 'react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-field';
import {
	EmailProvider,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	MailboxFormFields,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';

interface MailboxFormWrapperProps {
	index: number;
	isAutoFocusEnabled: boolean;
	mailbox: MailboxForm< EmailProvider >;
	onFieldValueChanged?: ( field: MailboxFormFieldBase< string > ) => void;
}

type FieldValueChangedHandler = ( field: MailboxFormFieldBase< string > ) => void;

interface CommonFieldProps {
	field: MailboxFormFieldBase< string >;
	isFirstVisibleField: boolean;
	onFieldValueChanged: FieldValueChangedHandler;
	onRequestFieldValidation: () => void;
	isAutoFocusEnabled: boolean;
}

type MailboxFormWrapperWithCommonProps = MailboxFormWrapperProps & {
	getCommonFieldProps: (
		field: MailboxFormFieldBase< string >,
		onFieldValueChanged: FieldValueChangedHandler,
		mailbox: MailboxForm< EmailProvider >
	) => CommonFieldProps;
	formFields: MailboxFormFields;
};

const createCommonFieldPropsHandler = ( formIndex: number, isAutoFocusEnabled: boolean ) => {
	let renderPosition = 0;

	return (
		field: MailboxFormFieldBase< string >,
		onFieldValueChanged: FieldValueChangedHandler,
		mailbox: MailboxForm< EmailProvider >
	): CommonFieldProps => {
		if ( field.isVisible ) {
			++renderPosition;
		}

		return {
			field,
			onFieldValueChanged,
			onRequestFieldValidation: () => mailbox.validateField( field.fieldName ),
			isAutoFocusEnabled,
			isFirstVisibleField: formIndex === 0 && renderPosition === 1,
		};
	};
};

const renderUserFormFields = ( {
	formFields,
	getCommonFieldProps,
	isRtl,
	mailbox,
	onFieldValueChanged = () => undefined,
}: MailboxFormWrapperWithCommonProps & {
	isRtl: boolean;
} ) => {
	const domainAffix = {
		[ isRtl ? 'textInputPrefix' : 'textInputSuffix' ]: `\u200e@${ formFields.domain.value }\u202c`,
	};

	return (
		<>
			<MailboxField
				lowerCaseChangeValue
				{ ...getCommonFieldProps( formFields.mailbox, onFieldValueChanged, mailbox ) }
				{ ...domainAffix }
			/>

			<MailboxField
				isPasswordField
				{ ...getCommonFieldProps( formFields.password, onFieldValueChanged, mailbox ) }
			/>
		</>
	);
};

const GoogleFormFields = ( props: MailboxFormWrapperWithCommonProps ) => {
	const isRtl = useRtl();
	const { formFields, getCommonFieldProps, mailbox, onFieldValueChanged = () => undefined } = props;
	const googleFormFields = formFields as GoogleMailboxFormFields;

	return (
		<>
			{ googleFormFields.firstName && (
				<MailboxField
					{ ...getCommonFieldProps( googleFormFields.firstName, onFieldValueChanged, mailbox ) }
				/>
			) }

			{ googleFormFields.lastName && (
				<MailboxField
					{ ...getCommonFieldProps( googleFormFields.lastName, onFieldValueChanged, mailbox ) }
				/>
			) }

			{ renderUserFormFields( { ...props, isRtl } ) }
		</>
	);
};

const TitanFormFields = ( props: MailboxFormWrapperWithCommonProps ) => {
	const isRtl = useRtl();
	const { formFields, getCommonFieldProps, mailbox, onFieldValueChanged = () => undefined } = props;
	const titanFormFields = formFields as TitanMailboxFormFields;

	return (
		<>
			{ titanFormFields.name && (
				<MailboxField
					{ ...getCommonFieldProps( titanFormFields.name, onFieldValueChanged, mailbox ) }
				/>
			) }

			{ renderUserFormFields( { ...props, isRtl } ) }

			{ titanFormFields.alternativeEmail && (
				<MailboxField
					{ ...getCommonFieldProps(
						titanFormFields.alternativeEmail,
						onFieldValueChanged,
						mailbox
					) }
				/>
			) }
		</>
	);
};

const MailboxFormWrapper = ( props: PropsWithChildren< MailboxFormWrapperProps > ): JSX.Element => {
	const { children, index, isAutoFocusEnabled, mailbox } = props;
	const getCommonFieldProps = createCommonFieldPropsHandler( index, isAutoFocusEnabled );
	const formFields = mailbox.formFields;
	const commonProps = { ...props, formFields, getCommonFieldProps };

	return (
		<div>
			<div className="mailbox-form-wrapper__fields mailbox-form-wrapper__new-mailbox">
				{ mailbox.provider === EmailProvider.Titan ? (
					<TitanFormFields { ...commonProps } />
				) : (
					<GoogleFormFields { ...commonProps } />
				) }
			</div>

			<div className="mailbox-form-wrapper__children">{ children }</div>
		</div>
	);
};

export { MailboxFormWrapper };
export type { MailboxFormWrapperProps };

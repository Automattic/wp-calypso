export type SecuritySMSNumber = {
	phoneNumber: string;
	countryCode: string;
	countryNumericCode: string;
};

export type SecuritySMSFormData = {
	smsNumber: SecuritySMSNumber;
	smsCode: string;
};

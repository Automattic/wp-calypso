import { translate } from 'i18n-calypso';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/slides.svg';

const getEmailForwardingFeatures = () => {
	return [ translate( 'No billing' ), translate( 'Receive emails sent to your custom domain' ) ];
};

const getGoogleAppLogos = () => {
	const translateOptions = { textOnly: true };

	return [
		{
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon', translateOptions ),
			title: translate( 'Gmail', translateOptions ),
		},
		{
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon', translateOptions ),
			title: translate( 'Google Calendar', translateOptions ),
		},
		{
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon', translateOptions ),
			title: translate( 'Google Drive', translateOptions ),
		},
		{
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon', translateOptions ),
			title: translate( 'Google Docs', translateOptions ),
		},
		{
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon', translateOptions ),
			title: translate( 'Google Sheets', translateOptions ),
		},
		{
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon', translateOptions ),
			title: translate( 'Google Slides', translateOptions ),
		},
	];
};

const getGoogleFeatures = () => {
	return [
		translate( 'Annual billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'Video calls, docs, spreadsheets, and more' ),
		translate( 'Work from anywhere on any device – even offline' ),
	];
};

const getTitanFeatures = ( isMonthlyProduct = true ) => {
	return [
		isMonthlyProduct ? translate( 'Monthly billing' ) : translate( 'Annual billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'One-click import of existing emails and contacts' ),
	];
};

export { getEmailForwardingFeatures, getGoogleAppLogos, getGoogleFeatures, getTitanFeatures };

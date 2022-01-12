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
	const options = { textOnly: true };
	return [
		{
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon', options ),
			title: translate( 'Gmail', options ),
		},
		{
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon', options ),
			title: translate( 'Google Calendar', options ),
		},
		{
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon', options ),
			title: translate( 'Google Drive', options ),
		},
		{
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon', options ),
			title: translate( 'Google Docs', options ),
		},
		{
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon', options ),
			title: translate( 'Google Sheets', options ),
		},
		{
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon', options ),
			title: translate( 'Google Slides', options ),
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

const getTitanFeatures = () => {
	return [
		translate( 'Monthly billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'One-click import of existing emails and contacts' ),
	];
};

export { getEmailForwardingFeatures, getGoogleAppLogos, getGoogleFeatures, getTitanFeatures };

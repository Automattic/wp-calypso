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

const getGoogleLogos = () => {
	return [
		{
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon' ),
			title: 'Gmail',
		},
		{
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon' ),
			title: 'Google Calendar',
		},
		{
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon' ),
			title: 'Google Docs',
		},
		{
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon' ),
			title: 'Google Drive',
		},
		{
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon' ),
			title: 'Google Sheets',
		},
		{
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon' ),
			title: 'Google Slides',
		},
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

export { getEmailForwardingFeatures, getGoogleFeatures, getGoogleLogos, getTitanFeatures };

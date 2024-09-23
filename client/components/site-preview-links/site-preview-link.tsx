import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { trailingslashit } from 'calypso/lib/route';
import ClipboardButtonInput from '../clipboard-button-input';
import { PreviewLink } from './use-site-preview-links';

const HelpText = styled.p( {
	display: 'block',
	margin: '5px 0',
	fontSize: '0.875rem',
	fontStyle: 'italic',
	fontWeight: 400,
	color: 'var(--color-text-subtle)',
} );

/**
 * Calculate the time until a given date
 * @param {string} dateString The target date string
 * @returns {Array} An array containing the days and hours until the target date. Example for 2 days and 3 hours: [2, 3]
 */
const timeUntil = ( dateString: string ) => {
	// Parse the target date from the input string
	const targetDate = new Date( dateString );

	// Get the current date
	const currentDate = new Date();

	// Calculate the difference in milliseconds
	const diffInMs = targetDate.getTime() - currentDate.getTime();

	// Convert milliseconds to total hours and days
	const totalHours = Math.floor( diffInMs / ( 1000 * 60 * 60 ) );
	const days = Math.floor( totalHours / 24 );
	const hours = totalHours % 24;

	// Return the result as an object or string
	return [ days, hours ];
};

type SitePreviewLinkProps = {
	siteUrl: string;
	disabled: boolean;
} & PreviewLink;

const SitePreviewLink = ( {
	code,
	expires_at,
	isCreating = false,
	isRemoving = false,
	disabled,
	siteUrl,
}: SitePreviewLinkProps ) => {
	const translate = useTranslate();

	let linkValue = `${ trailingslashit( siteUrl ) }?share=${ code }`;
	if ( isCreating ) {
		linkValue = translate( 'Loading…' );
	} else if ( isRemoving ) {
		linkValue = translate( 'Disabling…' );
	}

	const hasExpiration = expires_at && expires_at.length > 0;
	let linkExpiryCopy: ReactNode = '';
	if ( hasExpiration ) {
		const [ days, hours ] = timeUntil( expires_at );
		linkExpiryCopy = translate( 'Expires in %(days)d days, %(hours)d hours.', {
			args: { days, hours },
			comment:
				'%(days)d is the number of days until the link expires. %(hours)d is the number of hours until the link expires.',
		} );
	}

	return (
		<>
			<ClipboardButtonInput key={ code } value={ linkValue } disabled={ disabled } />
			<HelpText>
				{ translate( 'Anyone with the link can view your site.' ) +
					( hasExpiration ? ' • ' + linkExpiryCopy : '' ) }
			</HelpText>
		</>
	);
};

export default SitePreviewLink;

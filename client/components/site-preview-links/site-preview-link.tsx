import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
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

const Separator = styled.span( {
	'::before': {
		content: '"•"',
		margin: '0 8px',
	},
} );

type LinkExpiryCopyProps = {
	expiresAt: string;
};

const LinkExpiryCopy = ( { expiresAt }: LinkExpiryCopyProps ) => {
	const translate = useTranslate();

	const now = moment();
	const expiryDate = moment( expiresAt );

	const difference = expiryDate.diff( now );

	if ( difference < 0 ) {
		return translate( 'Expired.' );
	}

	const duration = moment.duration( difference );
	if ( duration.asDays() < 1 || duration.hours() === 0 ) {
		// Less than 1 day left, or more than 1 day left but no hours need to be appended
		// We can utilize moment.js to get the duration string
		const durationString = expiryDate.toNow( true );
		return translate( 'Expires in %(durationString)s', {
			args: { durationString },
			comment:
				'Duration until the link expires. It is certain that the duration is less than 1 day. The duration string is localized by moment.js. Example: "30 minutes", "32 seconds", "21 hours".',
		} );
	}

	// Unfortunately, moment.js does not provide a way to get the duration string for more than 1 day in our desired format, i.e. e.g.:"%{d} days, %{h} hours".

	duration.add( 1, 'hour' ); // Add 1 hour to the duration to round up the day for case where the user just created the link, e.g.: we prefer to show "Expires in 3 days", instead of "Expires in 2 days, 23 hours".
	const days = Math.floor( duration.asDays() );
	const hours = duration.hours();
	const hasHours = hours > 0; // Despite previous check whether hours are 0, we need to check again after we round up the hours
	return (
		<>
			{ translate( 'Expires in %(days)d day', 'Expires in %(days)d days', {
				count: days,
				args: { days },
				comment:
					'%(days) is the number of days until the link expires. We know it is at least 1 day.',
			} ) }
			{ hasHours && ', ' }
			{ hasHours &&
				translate( '%(hours)d hour', '%(hours)d hours', {
					count: hours,
					args: { hours },
					comment: '%{hours} is the number of hours until the link expires, in the range of 1-23.',
				} ) }
		</>
	);
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
	return (
		<>
			<ClipboardButtonInput key={ code } value={ linkValue } disabled={ disabled } />
			<HelpText>
				{ hasExpiration ? (
					<>
						{ translate( 'Anyone with the link can view your site' ) }
						<Separator />
						<LinkExpiryCopy expiresAt={ expires_at } />
					</>
				) : (
					translate( 'Anyone with the link can view your site.' )
				) }
			</HelpText>
		</>
	);
};

export default SitePreviewLink;

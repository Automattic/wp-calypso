import styled from '@emotion/styled';
import { __, _n, sprintf } from '@wordpress/i18n';
import moment from 'moment';
import ClipboardInputControl from '../clipboard-input-control';

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
	const now = moment();
	const expiryDate = moment( expiresAt );

	const difference = expiryDate.diff( now );

	if ( difference < 0 ) {
		return __( 'Expired.' );
	}

	const duration = moment.duration( difference );
	if ( duration.asDays() < 1 || duration.hours() === 0 ) {
		// Less than 1 day left, or more than 1 day left but no hours need to be appended
		// We can utilize moment.js to get the duration string
		const durationString = expiryDate.toNow( true );
		return sprintf(
			// translators: Duration until the link expires. It is certain that the duration is less than 1 day. The duration string is localized by moment.js. Example: "30 minutes", "32 seconds", "21 hours".
			__( 'Expires in %(durationString)s' ),
			{ durationString }
		);
	}

	// Unfortunately, moment.js does not provide a way to get the duration string for more than 1 day in our desired format, i.e. e.g.:"%{d} days, %{h} hours".

	duration.add( 1, 'hour' ); // Add 1 hour to the duration to round up the day for case where the user just created the link, e.g.: we prefer to show "Expires in 3 days", instead of "Expires in 2 days, 23 hours".
	const days = Math.floor( duration.asDays() );
	const hours = duration.hours();
	const hasHours = hours > 0; // Despite previous check whether hours are 0, we need to check again after we round up the hours
	return (
		<>
			{ sprintf(
				// translators: %(days) is the number of days until the link expires. We know it is at least 1 day.
				_n( 'Expires in %(days)d day', 'Expires in %(days)d days', days ),
				{ days }
			) }
			{ hasHours && ', ' }
			{ hasHours &&
				sprintf(
					// translators: %(hours) is the number of hours until the link expires, in the range of 1-23.
					_n( '%(hours)d hour', '%(hours)d hours', hours ),
					{ hours }
				) }
		</>
	);
};

type SitePreviewLinkProps = {
	code: string;
	created_at: string;
	expires_at?: string;
	label?: string;
	hideLabelFromVision?: boolean;
	siteUrl: string;
	disabled: boolean;
	onCopy?: () => void;
	isCreating?: boolean;
	isRemoving?: boolean;
};

const SitePreviewLink = ( {
	code,
	expires_at,
	label,
	hideLabelFromVision,
	siteUrl,
	disabled,
	onCopy,
	isCreating = false,
	isRemoving = false,
}: SitePreviewLinkProps ) => {
	let linkValue = `${ siteUrl }?share=${ code }`;
	if ( isCreating ) {
		linkValue = __( 'Loading…' );
	} else if ( isRemoving ) {
		linkValue = __( 'Disabling…' );
	}

	const hasExpiration = expires_at && expires_at.length > 0;
	return (
		<ClipboardInputControl
			key={ code }
			value={ linkValue }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
			disabled={ disabled }
			help={
				hasExpiration ? (
					<>
						{ __( 'Anyone with the link can view your site' ) }
						<Separator />
						<LinkExpiryCopy expiresAt={ expires_at } />
					</>
				) : (
					__( 'Anyone with the link can view your site.' )
				)
			}
			onCopy={ onCopy }
		/>
	);
};

export default SitePreviewLink;

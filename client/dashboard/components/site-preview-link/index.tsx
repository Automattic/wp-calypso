import styled from '@emotion/styled';
import { __, _n, sprintf } from '@wordpress/i18n';
import ClipboardInputControl from '../clipboard-input-control';

const Separator = styled.span( {
	'::before': {
		content: '"•"',
		margin: '0 8px',
	},
} );

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const ONE_DAY_IN_MILLISECONDS = 24 * ONE_HOUR_IN_MILLISECONDS;
const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS;
const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

type LinkExpiryCopyProps = {
	expiresAt: string;
};

function getExpiryStringLessThanOneDay( expiryDate: Date, now: Date ) {
	const expiryInSeconds = Math.round( ( expiryDate.getTime() - now.getTime() ) / 1000 );

	if ( expiryInSeconds < ONE_MINUTE_IN_SECONDS ) {
		return sprintf(
			// translators: %(seconds) is the number of seconds until the link expires.
			_n( 'Expires in %(seconds)d second', 'Expires in %(seconds)d seconds', expiryInSeconds ),
			{ seconds: expiryInSeconds }
		);
	}

	if ( expiryInSeconds < ONE_HOUR_IN_SECONDS ) {
		const minutes = Math.round( expiryInSeconds / ONE_MINUTE_IN_SECONDS );
		return sprintf(
			// translators: %(minutes) is the number of minutes until the link expires.
			_n( 'Expires in %(minutes)d minute', 'Expires in %(minutes)d minutes', minutes ),
			{ minutes }
		);
	}

	if ( expiryInSeconds < ONE_DAY_IN_SECONDS ) {
		const hours = Math.round( expiryInSeconds / ONE_HOUR_IN_SECONDS );
		return sprintf(
			// translators: %(hours) is the number of hours until the link expires.
			_n( 'Expires in %(hours)d hour', 'Expires in %(hours)d hours', hours ),
			{ hours }
		);
	}

	const days = Math.round( expiryInSeconds / ONE_DAY_IN_SECONDS );
	return sprintf(
		// translators: %(days) is the number of days until the link expires.
		_n( 'Expires in %(days)d day', 'Expires in %(days)d days', days ),
		{ days }
	);
}

const LinkExpiryCopy = ( { expiresAt }: LinkExpiryCopyProps ) => {
	const now = new Date();
	const expiryDate = new Date( expiresAt );

	const difference = expiryDate.getTime() - now.getTime();
	if ( difference < 0 ) {
		return __( 'Expired.' );
	}

	// Less than 1 day left.
	if ( difference < ONE_DAY_IN_MILLISECONDS ) {
		return getExpiryStringLessThanOneDay( expiryDate, now );
	}

	// Add 1 hour to the duration to round up the day for case where the user just created the link.
	// e.g.: we prefer to show "Expires in 3 days", instead of "Expires in 2 days, 23 hours".
	const roundedUpExpiryDate = new Date( expiryDate.getTime() + ONE_HOUR_IN_MILLISECONDS );
	const roundedUpDifference = Math.abs( roundedUpExpiryDate.getTime() - now.getTime() );

	const totalHours = Math.floor( roundedUpDifference / ONE_HOUR_IN_MILLISECONDS );
	const days = Math.floor( totalHours / 24 );
	const hours = totalHours % 24;
	const hasHours = hours > 0;

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

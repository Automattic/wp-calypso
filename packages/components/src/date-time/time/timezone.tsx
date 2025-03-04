/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSettings as getDateSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import Tooltip from '../../tooltip';
import { TimeZone as StyledComponent } from './styles';

/**
 * Displays timezone information when user timezone is different from site
 * timezone.
 */
const TimeZone = () => {
	const { timezone } = getDateSettings();

	// Convert timezone offset to hours.
	const userTimezoneOffset = -1 * ( new Date().getTimezoneOffset() / 60 );

	// System timezone and user timezone match, nothing needed.
	// Compare as numbers because it comes over as string.
	if ( Number( timezone.offset ) === userTimezoneOffset ) {
		return null;
	}

	const offsetSymbol = Number( timezone.offset ) >= 0 ? '+' : '';
	const zoneAbbr =
		'' !== timezone.abbr && isNaN( Number( timezone.abbr ) )
			? timezone.abbr
			: `UTC${ offsetSymbol }${ timezone.offsetFormatted }`;

	// Replace underscore with space in strings like `America/Costa_Rica`.
	const prettyTimezoneString = timezone.string.replace( '_', ' ' );

	const timezoneDetail =
		'UTC' === timezone.string
			? __( 'Coordinated Universal Time' )
			: `(${ zoneAbbr }) ${ prettyTimezoneString }`;

	// When the prettyTimezoneString is empty, there is no additional timezone
	// detail information to show in a Tooltip.
	const hasNoAdditionalTimezoneDetail =
		prettyTimezoneString.trim().length === 0;

	return hasNoAdditionalTimezoneDetail ? (
		<StyledComponent className="components-datetime__timezone">
			{ zoneAbbr }
		</StyledComponent>
	) : (
		<Tooltip placement="top" text={ timezoneDetail }>
			<StyledComponent className="components-datetime__timezone">
				{ zoneAbbr }
			</StyledComponent>
		</Tooltip>
	);
};

export default TimeZone;

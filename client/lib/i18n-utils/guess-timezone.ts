// This list comes from https://github.com/eggert/tz/blob/master/backward
const linkedTimezones = {
	'Africa/Asmera': 'Africa/Nairobi',
	'Africa/Timbuktu': 'Africa/Abidjan',
	'America/Argentina/ComodRivadavia': 'America/Argentina/Catamarca',
	'America/Atka': 'America/Adak',
	'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
	'America/Catamarca': 'America/Argentina/Catamarca',
	'America/Coral_Harbour': 'America/Atikokan',
	'America/Cordoba': 'America/Argentina/Cordoba',
	'America/Ensenada': 'America/Tijuana',
	'America/Fort_Wayne': 'America/Indiana/Indianapolis',
	'America/Indianapolis': 'America/Indiana/Indianapolis',
	'America/Jujuy': 'America/Argentina/Jujuy',
	'America/Knox_IN': 'America/Indiana/Knox',
	'America/Louisville': 'America/Kentucky/Louisville',
	'America/Mendoza': 'America/Argentina/Mendoza',
	'America/Montreal': 'America/Toronto',
	'America/Porto_Acre': 'America/Rio_Branco',
	'America/Rosario': 'America/Argentina/Cordoba',
	'America/Santa_Isabel': 'America/Tijuana',
	'America/Shiprock': 'America/Denver',
	'America/Virgin': 'America/Port_of_Spain',
	'Antarctica/South_Pole': 'Pacific/Auckland',
	'Asia/Ashkhabad': 'Asia/Ashgabat',
	'Asia/Calcutta': 'Asia/Kolkata',
	'Asia/Chongqing': 'Asia/Shanghai',
	'Asia/Chungking': 'Asia/Shanghai',
	'Asia/Dacca': 'Asia/Dhaka',
	'Asia/Harbin': 'Asia/Shanghai',
	'Asia/Kashgar': 'Asia/Urumqi',
	'Asia/Katmandu': 'Asia/Kathmandu',
	'Asia/Macao': 'Asia/Macau',
	'Asia/Rangoon': 'Asia/Yangon',
	'Asia/Saigon': 'Asia/Ho_Chi_Minh',
	'Asia/Tel_Aviv': 'Asia/Jerusalem',
	'Asia/Thimbu': 'Asia/Thimphu',
	'Asia/Ujung_Pandang': 'Asia/Makassar',
	'Asia/Ulan_Bator': 'Asia/Ulaanbaatar',
	'Atlantic/Faeroe': 'Atlantic/Faroe',
	'Atlantic/Jan_Mayen': 'Europe/Oslo',
	'Australia/ACT': 'Australia/Sydney',
	'Australia/Canberra': 'Australia/Sydney',
	'Australia/LHI': 'Australia/Lord_Howe',
	'Australia/NSW': 'Australia/Sydney',
	'Australia/North': 'Australia/Darwin',
	'Australia/Queensland': 'Australia/Brisbane',
	'Australia/South': 'Australia/Adelaide',
	'Australia/Tasmania': 'Australia/Hobart',
	'Australia/Victoria': 'Australia/Melbourne',
	'Australia/West': 'Australia/Perth',
	'Australia/Yancowinna': 'Australia/Broken_Hill',
	'Europe/Belfast': 'Europe/London',
	'Europe/Tiraspol': 'Europe/Chisinau',
	'Pacific/Johnston': 'Pacific/Honolulu',
	'Pacific/Ponape': 'Pacific/Pohnpei',
	'Pacific/Samoa': 'Pacific/Pago_Pago',
	'Pacific/Truk': 'Pacific/Chuuk',
	'Pacific/Yap': 'Pacific/Chuuk',
};

/**
 * Potentially rewrite the timezone to what we have on the server-side.
 * See https://core.trac.wordpress.org/ticket/26656
 *
 * @param timezone A timezone string, like Asia/Calcutta.
 *
 * @returns A potentially rewritten timezone string, like Asia/Kolkata.
 */
function maybeRewriteTimezone( timezone: string ): string {
	if ( isLinkedTimezone( timezone ) ) {
		return linkedTimezones[ timezone ];
	}

	return timezone;
}

function isLinkedTimezone( timezone: string ): timezone is keyof typeof linkedTimezones {
	return timezone in linkedTimezones;
}

export default function guessTimezone(): string | undefined {
	// use Intl API when available and returning valid time zone
	try {
		const intlName = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return maybeRewriteTimezone( intlName );
	} catch ( e ) {
		// Intl unavailable, don't guess timezone.
		return undefined;
	}
}

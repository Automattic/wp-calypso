import { __ } from '@wordpress/i18n';

export interface HTTPCodeSerie {
	statusCode: number;
	label: string;
	showInLegend?: boolean;
}

export const useSuccessHttpCodeSeries = () => {
	const series: HTTPCodeSerie[] = [
		{
			statusCode: 200,
			label: __( '200: OK Response' ),
			showInLegend: true,
		},
		{
			statusCode: 301,
			label: __( '301: Moved Permanently' ),
			showInLegend: true,
		},
		{
			statusCode: 302,
			label: __( '302: Found' ),
			showInLegend: true,
		},
	];
	return series;
};

export const useErrorHttpCodeSeries = () => {
	const series: HTTPCodeSerie[] = [
		{
			statusCode: 400,
			label: __( '400: Bad Request' ),
			showInLegend: true,
		},
		{
			statusCode: 401,
			label: __( '401: Unauthorized' ),
			showInLegend: true,
		},
		{
			statusCode: 403,
			label: __( '403: Forbidden' ),
			showInLegend: true,
		},
		{
			statusCode: 404,
			label: __( '404: Not Found' ),
			showInLegend: true,
		},
		{
			statusCode: 500,
			label: __( '500: Internal Server Error' ),
			showInLegend: true,
		},
		{
			statusCode: 0,
			label: __( 'Other 4xx and 5xx errors' ),
			showInLegend: true,
		},
		{
			statusCode: 402,
			label: __( '402: Payment Required' ),
		},
		{
			statusCode: 405,
			label: __( '405: Method Not Allowed' ),
		},
		{
			statusCode: 406,
			label: __( '406: Not Acceptable' ),
		},
		{
			statusCode: 407,
			label: __( '407: Proxy Authentication Required' ),
		},
		{
			statusCode: 408,
			label: __( '408: Request Timeout' ),
		},
		{
			statusCode: 409,
			label: __( '409: Conflict' ),
		},
		{
			statusCode: 410,
			label: __( '410: Gone' ),
		},
		{
			statusCode: 411,
			label: __( '411: Length Required' ),
		},
		{
			statusCode: 412,
			label: __( '412: Precondition Failed' ),
		},
		{
			statusCode: 413,
			label: __( '413: Content Too Large' ),
		},
		{
			statusCode: 414,
			label: __( '414: URI Too Long' ),
		},
		{
			statusCode: 415,
			label: __( '415: Unsupported Media Type' ),
		},
		{
			statusCode: 416,
			label: __( '416: Range Not Satisfiable' ),
		},
		{
			statusCode: 417,
			label: __( '417: Expectation Failed' ),
		},
		{
			statusCode: 421,
			label: __( '421: Misdirected Request' ),
		},
		{
			statusCode: 422,
			label: __( '422: Unprocessable Content' ),
		},
		{
			statusCode: 423,
			label: __( '423: Locked' ),
		},
		{
			statusCode: 424,
			label: __( '424: Failed Dependency' ),
		},
		{
			statusCode: 425,
			label: __( '425: Too Early' ),
		},
		{
			statusCode: 426,
			label: __( '426: Upgrade Required' ),
		},
		{
			statusCode: 428,
			label: __( '428: Precondition Required' ),
		},
		{
			statusCode: 429,
			label: __( '429: Too Many Requests' ),
		},
		{
			statusCode: 431,
			label: __( '431: Request Header Fields Too Large' ),
		},
		{
			statusCode: 451,
			label: __( '451: Unavailable For Legal Reasons' ),
		},
		{
			statusCode: 501,
			label: __( '501: Not Implemented' ),
		},
		{
			statusCode: 502,
			label: __( '502: Bad Gateway' ),
		},
		{
			statusCode: 503,
			label: __( '503: Service Unavailable' ),
		},
		{
			statusCode: 504,
			label: __( '504: Gateway Timeout' ),
		},
		{
			statusCode: 505,
			label: __( '505: HTTP Version Not Supported' ),
		},
		{
			statusCode: 506,
			label: __( '506: Variant Also Negotiates' ),
		},
		{
			statusCode: 507,
			label: __( '507: Insufficient Storage' ),
		},
		{
			statusCode: 508,
			label: __( '508: Loop Detected' ),
		},
		{
			statusCode: 510,
			label: __( '510: Not Extended' ),
		},
		{
			statusCode: 511,
			label: __( '511: Network Authentication Required' ),
		},
	];
	return series;
};

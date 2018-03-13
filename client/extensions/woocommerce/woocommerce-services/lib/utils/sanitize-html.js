/**
 * External dependencies
 */
import { sanitize } from 'dompurify';

export default ( html ) => {
	return {
		__html: sanitize( html,
			{
				ALLOWED_TAGS: [
					'a',
					'strong',
					'em',
					'u',
					'tt',
					's',
				],
				ALLOWED_ATTR: [
					'target',
					'href',
				],
			}
		),
	};
};

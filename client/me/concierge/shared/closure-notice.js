import 'moment-timezone'; // monkey patches the existing moment.js
import { CompactCard as Card } from '@automattic/components';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

const DATE_FORMAT = 'LLL';

const ClosureNotice = ( { closesAt, displayAt, reopensAt, isGM } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	if ( ! currentDate.isBetween( displayAt, reopensAt ) ) {
		return null;
	}

	/** @type {Record<string, { before: string, during: string, reason?: string }>} */
	const MESSAGES = {
		default: {
			before: translate(
				'{{strong}}Notice:{{/strong}} Quick Start sessions will be closed from %(closesAt)s until %(reopensAt)s. ' +
					'If you need to get in touch with us, you’ll be able to {{link}}submit a support request{{/link}} ' +
					'and we’ll get to it as fast as we can. Thank you!',
				{
					args: {
						closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
						reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					},
					components: {
						link: <a href="/help/contact" />,
						strong: <strong />,
					},
				}
			),
			during: translate(
				'{{strong}}Quick Start Sessions will be closed from %(closesAt)s – %(reopensAt)s for the New Year’s holiday.{{/strong}}{{br/}}' +
					'If you need to get in touch with us, please submit a {{link}}support request from this page{{/link}} and we will get to it as fast as we can. ' +
					'Quick Start Sessions will re-open at %(reopensAt)s. Thank you for your understanding!',
				{
					args: {
						closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
						reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					},
					components: {
						link: <a href="/help/contact" />,
						strong: <strong />,
						br: <br />,
					},
				}
			),
		},
		gm: {
			before: translate(
				'{{strong}}Note:{{/strong}} Support sessions will not be available between %(closesAt)s and %(reopensAt)s.',
				{
					args: {
						closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
						reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					},
					components: {
						strong: <strong />,
					},
				}
			),
			during: translate(
				'{{strong}}Note:{{/strong}} Support sessions are not available before %(reopensAt)s.',
				{
					args: {
						reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					},
					components: {
						strong: <strong />,
					},
				}
			),
			reason: translate(
				'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form: {{contactLink}}https://wordpress.com/help/contact{{/contactLink}}',
				{
					components: {
						contactLink: <a href="/help/contact" />,
					},
				}
			),
		},
	};

	const variant = MESSAGES[ isGM ? 'gm' : 'default' ];

	return (
		<Card>
			<VStack>
				<div>{ currentDate.isBefore( closesAt ) ? variant.before : variant.during }</div>
				{ variant.reason && <div>{ variant.reason }</div> }
			</VStack>
		</Card>
	);
};

export default ClosureNotice;

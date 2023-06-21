import 'moment-timezone'; // monkey patches the existing moment.js
import { WPCOM_FEATURES_LIVE_SUPPORT } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FoldableCard from 'calypso/components/foldable-card';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

import './style.scss';

const DATE_FORMAT_SHORT = 'MMMM D';
const DATE_FORMAT_LONG = 'dddd, MMMM Do LT';

export default function GMClosureNotice( { compact, closesAt, reopensAt } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const hasLiveChat = useSelector( ( state ) =>
		Object.values( getSitesItems( state ) ).some( ( { ID } ) =>
			siteHasFeature( state, ID ?? 0, WPCOM_FEATURES_LIVE_SUPPORT )
		)
	);

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	const [ closes, reopens ] = [
		moment.tz( closesAt, guessedTimezone ),
		moment.tz( reopensAt, guessedTimezone ),
	];

	if ( ! currentDate.isBetween( closes, reopens ) ) {
		return null;
	}

	const HEADING = translate( 'Limited Support %(closes)s – %(reopens)s', {
		args: {
			closes: closes.format( DATE_FORMAT_SHORT ),
			reopens: reopens.format( reopens.isSame( closes, 'month' ) ? 'D' : DATE_FORMAT_SHORT ),
		},
	} );

	const mainMessageArgs = {
		closes_at: closes.format( DATE_FORMAT_LONG ),
		reopens_at: reopens.format( DATE_FORMAT_LONG ),
	};

	const MAIN_MESSAGES = {
		before: {
			hasLiveChat: translate(
				'Live chat support will be closed from %(closes_at)s until %(reopens_at)s. Customer support via email will remain open.',
				{ args: mainMessageArgs }
			),
			privateSupport: translate(
				'Private support will be closed from %(closes_at)s until %(reopens_at)s.',
				{ args: mainMessageArgs }
			),
		},
		during: {
			hasLiveChat: translate(
				'Live chat support is closed until %(reopens_at)s. In the meantime you can still reach us by email.',
				{ args: mainMessageArgs }
			),
			privateSupport: translate( 'Private support is closed until %(reopens_at)s.', {
				args: mainMessageArgs,
			} ),
		},
	};

	const REASON_MESSAGES = {
		hasLiveChat: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form: {{contactLink}}{{/contactLink}}',
			{
				components: {
					contactLink: <a href="/help/contact" />,
				},
				args: {
					linkUrl: 'https://wordpress.com/help/contact',
				},
			}
		),
		generalSupport: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, check our support site at {{supportLink}}%(linkUrl)s{{/supportLink}}',
			{
				components: {
					supportLink: <a href={ localizeUrl( 'https://wordpress.com/support/' ) } />,
				},
				args: {
					linkUrl: localizeUrl( 'https://wordpress.com/support/' ),
				},
			}
		),
	};

	const FORUMS_NOTE = translate(
		'Our staff will be keeping an eye on the {{link}}Forums{{/link}} for urgent matters.',
		{
			components: {
				link: <a href={ localizeUrl( 'https://en.forums.wordpress.com/forum/support/' ) } />,
			},
		}
	);

	const period = currentDate.isBefore( closes ) ? 'before' : 'during';
	const mainMessage = hasLiveChat
		? MAIN_MESSAGES[ period ].hasLiveChat
		: MAIN_MESSAGES[ period ].privateSupport;
	const reason = hasLiveChat ? REASON_MESSAGES.hasLiveChat : REASON_MESSAGES.generalSupport;

	if ( compact ) {
		return (
			<FoldableCard
				className="gm-closure-notice"
				clickableHeader={ true }
				compact={ true }
				header={ HEADING }
			>
				{ mainMessage }
				<br />
				<br />
				{ translate( '{{contactLink}}Read more.{{/contactLink}}', {
					components: { contactLink: <a href="/help/contact" /> },
				} ) }
			</FoldableCard>
		);
	}

	return (
		<div className="gm-closure-notice">
			<FormSectionHeading>{ HEADING }</FormSectionHeading>
			<div>
				<p>{ mainMessage }</p>
				<p>{ reason }</p>
				{ ! hasLiveChat && <p>{ FORUMS_NOTE }</p> }
			</div>
			<hr />
		</div>
	);
}

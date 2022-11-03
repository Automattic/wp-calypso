import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { format } from '@wordpress/date';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import './gm-closure-notice.scss';

const DATE_FORMAT_SHORT = 'F d';
const DATE_FORMAT_LONG = 'l, F jS h:i A';

type Props = {
	displayAt: string;
	closesAt: string;
	reopensAt: string;
	enabled: boolean;
};

function inBetween( start: Date, end: Date ) {
	const date = new Date();
	return date >= start && date <= end;
}

export function GMClosureNotice( { displayAt, closesAt, reopensAt, enabled }: Props ) {
	const { __ } = useI18n();

	if ( ! enabled ) {
		return null;
	}

	const displayAtDate = new Date( displayAt );
	const closesAtDate = new Date( closesAt );
	const reopensAtDate = new Date( reopensAt );

	const MAIN_MESSAGES = {
		before: sprintf(
			/* translators: closes_at and reopens_at are dates */
			__(
				'Live chat support will be closed from %(closes_at)s until %(reopens_at)s. Customer support via email will remain open.',
				__i18n_text_domain__
			),
			{
				closes_at: format( DATE_FORMAT_LONG, closesAtDate ),
				reopens_at: format( DATE_FORMAT_LONG, reopensAtDate ),
			}
		),
		during: sprintf(
			/* translators:  reopens_at is a date */
			__(
				'Live chat support is closed until %(reopens_at)s. In the meantime you can still reach us by email.',
				__i18n_text_domain__
			),
			{
				reopens_at: format( DATE_FORMAT_LONG, reopensAtDate ),
			}
		),
	};

	if ( ! inBetween( displayAtDate, reopensAtDate ) ) {
		return null;
	}

	const period = inBetween( closesAtDate, reopensAtDate ) ? 'during' : 'before';

	const isSameMonth = reopensAtDate.getMonth() === closesAtDate.getMonth();

	const heading = sprintf(
		/* translators: closes and reopens are dates */
		__( 'Limited Support %(closes)s – %(reopens)s', __i18n_text_domain__ ),
		{
			closes: format( DATE_FORMAT_SHORT, closesAtDate ),
			reopens: format( isSameMonth ? 'd' : DATE_FORMAT_SHORT, reopensAtDate ),
		}
	);

	return (
		<Panel className="a8c-components__gm-closure-notice">
			<PanelBody initialOpen={ false } title={ heading }>
				<PanelRow>{ MAIN_MESSAGES[ period ] }</PanelRow>
			</PanelBody>
		</Panel>
	);
}

import { Badge, Card } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { CALYPSO_CONTACT } from '@automattic/urls';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import QueryWordadsPayments from 'calypso/components/data/query-wordads-payments';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import Notice from 'calypso/components/notice';
import { useSelector } from 'calypso/state';
import { getWordadsSettings } from 'calypso/state/selectors/get-wordads-settings';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordAdsPayments } from 'calypso/state/wordads/payments/selectors';
import type { BadgeType } from '@automattic/components';

type Payment = {
	id: number;
	paymentDate: string;
	amount: number;
	status: string;
	paypalEmail: string;
	description: string;
};

type Payments = Payment[];

type WordAdSettings = {
	optimized_ads: boolean;
	paypal: string;
	show_to_logged_in: string;
	tos: string;
	display_options: {
		display_front_page: boolean;
		display_post: boolean;
		display_page: boolean;
		enable_header_ad: boolean;
		second_belowpost: boolean;
		inline_enabled: boolean;
		sidebar: boolean;
		display_archive: boolean;
	};
	ccpa_enabled: boolean;
	ccpa_privacy_policy_url: string;
	cmp_enabled: boolean;
};

const WordAdsPayments = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const payments: Payments = useSelector( ( state ) => getWordAdsPayments( state, siteId ?? 0 ) );
	const wordAdsSettings: WordAdSettings = useSelector( ( state ) =>
		getWordadsSettings( state, siteId )
	);

	function statusToType( status: string ) {
		const map = {
			paid: 'success',
			pending: 'info',
			failed: 'error',
		};
		return map[ status as keyof typeof map ] || 'warning';
	}

	function paymentsTable( currentPayments: Payments, type: string ) {
		const rows: React.ReactNode[] = [];
		const classes = clsx( 'payments_history' );

		currentPayments.forEach( ( payment ) => {
			rows.push(
				<tr key={ type + '-' + payment.id }>
					<td className="ads__payments-history-value">
						{ payment.status === 'pending' ? (
							<small>
								{ translate( 'Estimated' ) }: { payment.paymentDate }
							</small>
						) : (
							payment.paymentDate
						) }
					</td>
					<td className="ads__payments-history-value">
						${ formatNumber( payment.amount, { decimals: 2 } ) }
					</td>
					<td className="ads__payments-history-value">
						<Badge
							className="ads__payments-history-badge"
							type={ statusToType( payment.status ) as BadgeType }
						>
							{ payment.status }
						</Badge>
					</td>
					<td className="ads__payments-history-value">{ payment.paypalEmail }</td>
					<td className="ads__payments-history-value">{ payment.description }</td>
				</tr>
			);
		} );

		return (
			<Card className={ classes }>
				<div className="ads__module-header module-header">
					<h1 className="ads__module-header-title module-header-title">
						{ translate( 'Payments history' ) }
					</h1>
				</div>
				<div className="ads__module-content module-content">
					<table>
						<thead>
							<tr>
								<th className="ads__payments-history-header">{ translate( 'Payment Date' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Amount' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Status' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'PayPal' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Description' ) }</th>
							</tr>
						</thead>
						<tbody>{ rows }</tbody>
					</table>
				</div>
			</Card>
		);
	}

	function notices( currentPayments: Payments, currentWordAdsSettings: WordAdSettings ) {
		if ( ! currentPayments || ! currentWordAdsSettings ) {
			return null;
		}

		if ( ! currentWordAdsSettings.paypal ) {
			return null;
		}

		let hasMismatch = false;

		currentPayments.forEach( ( payment ) => {
			if ( payment.status === 'pending' && payment.paypalEmail !== currentWordAdsSettings.paypal ) {
				hasMismatch = true;
			}
		} );

		return hasMismatch ? (
			<Notice
				className="ads__activate-notice"
				status="is-warning"
				showDismiss={ false }
				text={ translate(
					'Your pending payment will be sent to a PayPal address different from your current address. Please {{contactSupportLink}}contact support{{/contactSupportLink}} if you need to change the PayPal address of your pending payment.',
					{
						components: {
							contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						},
					}
				) }
			/>
		) : null;
	}

	function empty() {
		return (
			<Card>
				{ translate(
					'You have no payments history. Payment will be made as soon as the total outstanding amount has reached $100.'
				) }
			</Card>
		);
	}

	return (
		<div>
			<QueryWordadsSettings siteId={ siteId } />
			<QueryWordadsPayments siteId={ siteId } />
			{ notices( payments, wordAdsSettings ) }
			{ payments && payments.length > 0 ? paymentsTable( payments, 'wordads' ) : empty() }
		</div>
	);
};

export default WordAdsPayments;

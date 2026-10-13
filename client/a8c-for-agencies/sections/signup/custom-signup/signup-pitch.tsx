/**
 * PROTOTYPE — proof of concept only.
 *
 * Sidebar pitch for `/custom-signup`: headline, program pitch, and headline
 * stats styled after the automattic.com/for-agencies stat blocks.
 */
import { agencyProgramStatsQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';

const FALLBACK_AGENCY_COUNT = 10000;

// Mirrors the contact form's count, rounded down so the copy reads as a stable "over N,000".
function useAgencyCountLabel() {
	const { data } = useQuery( agencyProgramStatsQuery() );
	const count = data ? Math.floor( data.active_agencies / 1000 ) * 1000 : FALLBACK_AGENCY_COUNT;
	return formatNumber( count );
}

export default function SignupPitch() {
	const translate = useTranslate();
	const agencyCount = useAgencyCountLabel();

	const stats = [
		{
			prefix: translate( 'Up to' ),
			value: '50%',
			label: translate( 'Recurring commissions through referrals' ),
		},
		{
			prefix: translate( 'Up to' ),
			value: '77%',
			label: translate( 'Off Automattic hosting and products' ),
		},
		{
			prefix: translate( 'Over' ),
			value: '$6M',
			label: translate( 'Qualified leads sent to partners' ),
		},
	];

	return (
		<div className="a4a-custom-signup-pitch">
			<h1 className="a4a-custom-signup-pitch-title">
				{ preventWidows(
					translate( 'Sign up and unlock the blueprint to grow your agency’s business' )
				) }
			</h1>
			<p className="a4a-custom-signup-pitch-description">
				{ preventWidows(
					translate(
						'Join over %(agencyCount)s agencies growing with the official WordPress partner program, and enjoy earning opportunities, sales training, priority support, and more.',
						{ args: { agencyCount } }
					)
				) }
			</p>
			<ul className="a4a-custom-signup-stats">
				{ stats.map( ( stat ) => (
					<li key={ stat.value } className="a4a-custom-signup-stat">
						{ /* Always rendered so the numbers line up across columns. */ }
						<span className="a4a-custom-signup-stat-prefix" aria-hidden={ ! stat.prefix }>
							{ stat.prefix ?? ' ' }
						</span>
						<span className="a4a-custom-signup-stat-value">{ stat.value }</span>
						<span className="a4a-custom-signup-stat-label">{ stat.label }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
}

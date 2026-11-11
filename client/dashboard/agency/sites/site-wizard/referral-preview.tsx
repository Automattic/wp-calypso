import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * A mock of the referral email, filled in as the agency types, so they know
 * what their client will open before it's sent.
 */
export default function ReferralPreview( {
	email,
	agencyName,
	hostName,
	total,
	sites,
	isMigration,
}: {
	email: string;
	agencyName?: string;
	hostName: string;
	/** Monthly price, formatted. */
	total?: string;
	sites: string[];
	isMigration: boolean;
} ) {
	const agency = agencyName || __( 'Your agency' );
	const shown = sites.slice( 0, 3 );
	const more = sites.length - shown.length;
	return (
		<figure className="agency-referral-preview" aria-label={ __( 'Preview of the email' ) }>
			<figcaption className="agency-referral-preview__caption">
				{ __( 'Sample of the email we’ll send' ) }
			</figcaption>
			<div className="agency-referral-preview__message">
				<dl className="agency-referral-preview__meta">
					<dt>{ __( 'From' ) }</dt>
					<dd>{ __( 'Automattic for Agencies' ) }</dd>
					<dt>{ __( 'To' ) }</dt>
					<dd dir="ltr">{ email.trim() || __( 'your client' ) }</dd>
					<dt>{ __( 'Subject' ) }</dt>
					<dd>
						{ sprintf(
							/* translators: 1: Agency name. 2: Hosting provider. */
							__( '%1$s set up %2$s hosting for you' ),
							agency,
							hostName
						) }
					</dd>
				</dl>
				<div className="agency-referral-preview__body">
					<p>{ __( 'Hi,' ) }</p>
					<p>
						{ isMigration
							? sprintf(
									/* translators: 1: Agency name. 2: Hosting provider. */
									__(
										'%1$s is moving your websites to %2$s and asked us to send you the hosting bill.'
									),
									agency,
									hostName
								)
							: sprintf(
									/* translators: 1: Agency name. 2: Hosting provider. */
									__(
										'%1$s is building your new website on %2$s and asked us to send you the hosting bill.'
									),
									agency,
									hostName
								) }
					</p>
					<div className="agency-referral-preview__order">
						<ul>
							{ shown.map( ( site ) => (
								<li key={ site } dir="ltr">
									{ site }
								</li>
							) ) }
							{ more > 0 && (
								<li>
									{ sprintf(
										/* translators: %d is the number of other sites. */
										_n( 'and %d more site', 'and %d more sites', more ),
										more
									) }
								</li>
							) }
						</ul>
						<p className="agency-referral-preview__total">
							<span>
								{ sprintf(
									/* translators: %s is the hosting provider. */
									__( '%s hosting' ),
									hostName
								) }
							</span>
							<strong>
								{ total
									? sprintf(
											/* translators: %s is a monthly price. */
											__( '%s/mo' ),
											total
										)
									: '—' }
							</strong>
						</p>
					</div>
					<span className="agency-referral-preview__button">{ __( 'Review and pay' ) }</span>
					<p className="agency-referral-preview__fine">
						{ sprintf(
							/* translators: %s is the agency name. */
							__( 'The bill comes to you, and %s keeps managing your sites.' ),
							agency
						) }
					</p>
				</div>
			</div>
		</figure>
	);
}

import config from '@automattic/calypso-config';
import { Card, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PressableUsageDetails from 'calypso/a8c-for-agencies/components/pressable-usage-details';
import { isPressableHostingProduct } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import useGetPressablePlanByProductId from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-get-pressable-plan-by-product-id';
import FormattedDate from 'calypso/components/formatted-date';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { getLicenseState, noop } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LicenseDetailsActions from './actions';
import type { ReferralAPIResponse } from 'calypso/a8c-for-agencies/sections/referrals/types';
import type { License } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	license: License;
	onCopyLicense?: () => void;
	licenseType: LicenseType;
	isChildLicense?: boolean;
	referral?: ReferralAPIResponse | null;
}

const DETAILS_DATE_FORMAT = 'YYYY-MM-DD h:mm:ss A';
const DETAILS_DATE_FORMAT_SHORT = 'YYYY-MM-DD';

export default function LicenseDetails( {
	license,
	onCopyLicense = noop,
	licenseType,
	isChildLicense,
	referral,
}: Props ) {
	const licenseKey = license.licenseKey;
	const product = license.product;
	const siteUrl = license.siteUrl;
	const blogId = license.blogId;
	const hasDownloads = license.hasDownloads;
	const issuedAt = license.issuedAt;
	const attachedAt = license.attachedAt;
	const revokedAt = license.revokedAt;

	const translate = useTranslate();
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const isPressableLicense = isPressableHostingProduct( licenseKey );

	const pressablePlan = useGetPressablePlanByProductId( { product_id: license.productId } );

	const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );

	return (
		<Card
			className={ clsx( 'license-details', {
				'license-details--child-license': isChildLicense,
			} ) }
		>
			<ul className="license-details__list">
				{ /* FIXME: This of a better handling without conditions */ }
				{ ! isPressableLicense && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'License code' ) }</h4>

						<div className="license-details__license-key-row">
							<code className="license-details__license-key">{ licenseKey }</code>

							<ClipboardButton
								text={ licenseKey }
								className="license-details__clipboard-button"
								borderless
								compact
								onCopy={ onCopyLicense }
							>
								<Gridicon icon="clipboard" />
							</ClipboardButton>
						</div>
					</li>
				) }
				{ isPressableLicense && licenseState !== LicenseState.Revoked && (
					<div>
						<h4 className="license-details__label">
							{ translate( 'Manage your Pressable licenses' ) }
						</h4>
						{ ! referral && pressablePlan && (
							<PressableUsageDetails existingPlan={ pressablePlan } />
						) }
					</div>
				) }

				<li className="license-details__list-item-small">
					<h4 className="license-details__label">{ translate( 'Issued on' ) }</h4>
					<FormattedDate date={ issuedAt } format={ DETAILS_DATE_FORMAT_SHORT } />
				</li>

				{ licenseState === LicenseState.Attached && (
					<li className="license-details__list-item-small">
						<h4 className="license-details__label">{ translate( 'Assigned on' ) }</h4>
						<FormattedDate date={ attachedAt } format={ DETAILS_DATE_FORMAT_SHORT } />
					</li>
				) }

				{ isAutomatedReferralsEnabled && referral && (
					<li className="license-details__list-item-small">
						<h4 className="license-details__label">{ translate( 'Owned by' ) }</h4>
						{ referral.client.email }
					</li>
				) }

				{ ! isPressableLicense && licenseState === LicenseState.Attached && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Site ID' ) }</h4>
						{ blogId ? <span>{ blogId }</span> : <Gridicon icon="minus" /> }
					</li>
				) }

				{ licenseState === LicenseState.Revoked && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Revoked on' ) }</h4>
						<FormattedDate date={ revokedAt } format={ DETAILS_DATE_FORMAT } />
					</li>
				) }
			</ul>

			<LicenseDetailsActions
				licenseKey={ licenseKey }
				product={ product }
				siteUrl={ siteUrl }
				licenseState={ licenseState }
				licenseType={ licenseType }
				hasDownloads={ hasDownloads }
				isChildLicense={ isChildLicense }
				isClientLicense={ !! ( isAutomatedReferralsEnabled && referral ) }
			/>
		</Card>
	);
}

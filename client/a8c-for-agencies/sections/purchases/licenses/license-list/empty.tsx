import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

interface Props {
	filter: LicenseFilter;
}

export default function LicenseListEmpty( { filter }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { data } = useFetchLicenseCounts( Infinity );

	const hasAssignedLicenses = data?.[ LicenseFilter.Attached ] > 0;

	const partnerCanIssueLicense = true; // FIXME: get this from state

	const licenseFilterStatusTitleMap = {
		[ LicenseFilter.NotRevoked ]: translate( 'No active licenses' ),
		[ LicenseFilter.Attached ]: translate( 'No assigned licenses.' ),
		[ LicenseFilter.Detached ]: translate( 'No unassigned licenses.' ),
		[ LicenseFilter.Revoked ]: translate( 'No revoked licenses.' ),
		[ LicenseFilter.Standard ]: translate( 'No standard licenses.' ),
	};

	const licenseFilterStatusTitle = licenseFilterStatusTitleMap[ filter ] as string;

	const onIssueNewLicense = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_empty_issue_license_click' ) );
	};

	const showLearnMoreLink = false; // FIXME: Remove this once the correct link is added

	return (
		<div className="license-list__empty-list">
			<h2>{ licenseFilterStatusTitle }</h2>

			{ showLearnMoreLink && filter === LicenseFilter.NotRevoked && (
				<p>
					{ translate(
						'Learn more about {{a}}adding licenses and billing {{icon}}{{/icon}}{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://" // FIXME: add the correct link
										target="_blank"
										rel="noreferrer"
									/>
								),
								icon: <Gridicon icon="external" size={ 16 } />,
							},
						}
					) }
				</p>
			) }

			{ filter === LicenseFilter.Detached && hasAssignedLicenses && (
				<p>{ translate( 'Every license you own is currently attached to a site.' ) }</p>
			) }

			<Button
				disabled={ ! partnerCanIssueLicense }
				href={ partnerCanIssueLicense ? A4A_MARKETPLACE_LINK : undefined }
				onClick={ onIssueNewLicense }
			>
				{ translate( 'Issue new license' ) }
			</Button>
		</div>
	);
}

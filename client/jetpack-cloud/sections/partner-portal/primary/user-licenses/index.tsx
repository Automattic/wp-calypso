import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackUserLicenses from 'calypso/components/data/query-jetpack-user-licenses';
import Main from 'calypso/components/main';
import LicensePreview from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import getSites from 'calypso/state/selectors/get-sites';
import { getUserLicenses } from 'calypso/state/user-licensing/selectors';

import './style.scss';

export default function UserLicenses() {
	const translate = useTranslate();
	const licenses = useSelector( getUserLicenses );
	const sites = useSelector( getSites );

	return (
		<Main wideLayout className="user-licenses">
			<DocumentHead title={ translate( 'User Licenses' ) } />
			<SidebarNavigation />
			<div className="user-licenses__header">
				<CardHeading size={ 36 }>{ translate( 'User Licenses' ) }</CardHeading>
				<a href="/partner-portal/licenses">{ translate( 'View Partner Licenses instead' ) }</a>
			</div>

			<QueryJetpackUserLicenses />

			{ licenses &&
				licenses.items &&
				licenses.items.map( ( license ) => {
					const site = sites.find( ( site ) => site.ID === license.blogId );

					return (
						<LicensePreview
							licenseKey={ license.licenseKey }
							product={ license.product }
							username={ license.username }
							blogId={ license.blogId }
							siteUrl={ ( site && site.URL ) || license.blogId }
							issuedAt={ license.issuedAt }
							attachedAt={ license.attachedAt }
							revokedAt={ license.revokedAt }
							key={ license.licenseKey }
						/>
					);
				} ) }
		</Main>
	);
}

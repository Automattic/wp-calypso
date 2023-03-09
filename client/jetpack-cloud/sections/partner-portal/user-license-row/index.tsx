import { Button, CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function UserLicenseRow( props ) {
	const { license, site } = props;
	const translate = useTranslate();

	return (
		<CompactCard className="user-license-row" key={ license.licenseKey }>
			<div className="user-license-row__description">
				{ ( site && site.domain ) || license.blogId }
			</div>
			<div className="user-license-row__date">{ license.issuedAt }</div>
			<div className="user-license-row__action">
				<Button compact>{ translate( 'Manage' ) }</Button>
			</div>
		</CompactCard>
	);
}

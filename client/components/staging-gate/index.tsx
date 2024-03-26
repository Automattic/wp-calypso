import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import Notice from 'calypso/components/notice';
import { useSelector } from 'calypso/state';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import type { SiteId } from 'calypso/types';

import './style.scss';

interface Props {
	children: ReactNode;
	siteId: SiteId | null;
}

const StagingGate: FC< Props > = ( { children, siteId } ) => {
	const translate = useTranslate();
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	const getNoticeBanner = () => {
		return (
			<Notice
				className="scheduled-updates__activating-notice"
				status="is-warning"
				showDismiss={ false }
				text={ translate( 'This feature is currently disabled on the staging site.' ) }
				icon="notice"
			></Notice>
		);
	};

	if ( isStagingSite ) {
		return (
			<div tabIndex={ -1 } className="staging-gate">
				{ getNoticeBanner() }
				<div className="staging-gate__content">{ children }</div>
			</div>
		);
	}
	return <div>{ children }</div>;
};

export default StagingGate;

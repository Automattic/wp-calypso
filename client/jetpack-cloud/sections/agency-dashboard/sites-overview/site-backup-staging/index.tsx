import QueryBackupStagingSite from 'calypso/components/data/query-backup-staging-site';
import { useSelector } from 'calypso/state';
import getBackupStagingSiteInfo from 'calypso/state/rewind/selectors/get-backup-staging-site-info';

import './style.scss';

const stagingIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="18"
		height="18"
		fill="none"
		viewBox="0 0 24 24"
		className="staging-icon"
	>
		<path
			fill="#4F3500"
			fillRule="evenodd"
			d="M16.365 4.868l-2.26 2.26.512 1.912 1.912.513 2.26-2.26a4 4 0 11-2.424-2.425z"
			clipRule="evenodd"
		></path>
		<path
			fill="#4F3500"
			fillRule="evenodd"
			d="M6.89 16.06a.5.5 0 10.706.708.5.5 0 00-.707-.707zM5.828 15a2 2 0 002.828 2.828l5.657-5.657a2 2 0 00-2.829-2.828L5.83 15z"
			clipRule="evenodd"
		></path>
	</svg>
);

interface Props {
	siteId: number | string;
}

export default function SiteBackupStaging( { siteId }: Props ) {
	const stagingInfo = useSelector( ( state ) => getBackupStagingSiteInfo( state, siteId ) );

	return (
		<>
			<QueryBackupStagingSite siteId={ siteId } />
			{ stagingInfo?.staging ? (
				<span className="site-backup-staging__staging-icon">{ stagingIcon }</span>
			) : (
				<></>
			) }
		</>
	);
}

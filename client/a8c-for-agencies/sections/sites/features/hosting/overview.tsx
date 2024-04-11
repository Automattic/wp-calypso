import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { Site } from '../../types';

import './style.scss';

type Props = {
	site: Site;
};

const HostingOverviewPreview = ( { site }: Props ) => {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'Hosting' ) } />
			<div className="site-preview-pane__hosting-content">
				<ul>
					<li>Status</li>
					<li>Host</li>
					<li>
						PHP version:
						{ site.php_version_num > 0 ? site.php_version_num : translate( 'Unknown' ) }
					</li>
					<li>WP version</li>
				</ul>
			</div>
		</>
	);
};

export default HostingOverviewPreview;

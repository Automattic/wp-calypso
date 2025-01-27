import { Panel } from 'calypso/components/panel';
import StagingSiteWrapper from './components/staging-site';

import './style.scss';

export default function StagingSite() {
	return (
		<Panel className="tools-staging-site">
			<StagingSiteWrapper />
		</Panel>
	);
}

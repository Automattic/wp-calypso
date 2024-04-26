import { SiteActions } from '../sites-site-actions';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
};

const ActionsField = ( { site }: Props ) => {
	return (
		<div className="sites-dataviews__actions">
			<SiteActions site={ site } />
		</div>
	);
};

export default ActionsField;

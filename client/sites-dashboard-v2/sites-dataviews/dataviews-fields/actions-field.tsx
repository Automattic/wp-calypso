import { SiteActions } from '../sites-site-actions';
import type { SiteExcerptData } from '@automattic/sites';
import type { MouseEvent, KeyboardEvent } from 'react';

type Props = {
	site: SiteExcerptData;
};

const ActionsField = ( { site }: Props ) => {
	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
		<div
			className="sites-dataviews__actions"
			onClick={ ( e: MouseEvent ) => e.stopPropagation() }
			onKeyDown={ ( e: KeyboardEvent ) => e.stopPropagation() }
		>
			<SiteActions site={ site } />
		</div>
	);
};

export default ActionsField;

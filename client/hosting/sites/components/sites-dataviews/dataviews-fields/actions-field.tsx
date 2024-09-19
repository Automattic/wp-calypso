import { SiteActions } from '../sites-site-actions';
import type { SiteExcerptData } from '@automattic/sites';
import type { MouseEvent, KeyboardEvent } from 'react';

type Props = {
	site: SiteExcerptData;
};

const ActionsField = ( { site }: Props ) => {
	const handleClickOrKeyDown = ( event: MouseEvent | KeyboardEvent ) => {
		const target = event.target as HTMLElement;

		// We have to bypass the link to prevent the page from full-reload
		if ( ! target.closest( 'a' ) ) {
			event.stopPropagation();
		}
	};

	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
		<div
			className="sites-dataviews__actions"
			onClick={ handleClickOrKeyDown }
			onKeyDown={ handleClickOrKeyDown }
		>
			<SiteActions site={ site } />
		</div>
	);
};

export default ActionsField;

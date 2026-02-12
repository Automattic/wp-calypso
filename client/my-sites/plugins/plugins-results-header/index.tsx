import clsx from 'clsx';
import BrowseAllAction from './browse-all-action';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

export default function PluginsResultsHeader( {
	className = '',
	title,
	subtitle,
	browseAllLink,
	resultCount,
	listName,
	isRootPage = true,
}: {
	title: TranslateResult;
	subtitle: TranslateResult;
	browseAllLink?: string;
	resultCount?: string;
	className?: string;
	listName?: string;
	isRootPage?: boolean;
} ) {
	const TitleTag = isRootPage ? 'h2' : 'h1';

	return (
		<div className={ clsx( 'plugins-results-header', className ) }>
			{ ( title || subtitle ) && (
				<div className="plugins-results-header__titles">
					{ title && <TitleTag className="plugins-results-header__title">{ title }</TitleTag> }
					{ subtitle && <p className="plugins-results-header__subtitle">{ subtitle }</p> }
				</div>
			) }
			{ ( browseAllLink || resultCount ) && (
				<div className="plugins-results-header__actions">
					{ browseAllLink && (
						<BrowseAllAction browseAllLink={ browseAllLink } listName={ listName } />
					) }
					{ resultCount && <span className="plugins-results-header__action">{ resultCount }</span> }
				</div>
			) }
		</div>
	);
}

export { default as BrowseAllAction } from './browse-all-action';

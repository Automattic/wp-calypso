import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { TranslateResult } from 'calypso/../packages/i18n-calypso/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );
	const TitleTag = isRootPage ? 'h2' : 'h1';

	return (
		<div className={ clsx( 'plugins-results-header', className ) }>
			{ ( title || subtitle ) && (
				<div className="plugins-results-header__titles">
					{ title && <TitleTag className="plugins-results-header__title">{ title }</TitleTag> }
					{ subtitle && <div className="plugins-results-header__subtitle">{ subtitle }</div> }
				</div>
			) }
			{ ( browseAllLink || resultCount ) && (
				<div className="plugins-results-header__actions">
					{ browseAllLink && (
						<a
							className="plugins-results-header__action"
							href={ browseAllLink }
							onClick={ () => {
								recordTracksEvent( 'calypso_plugin_browser_all_click', {
									site: selectedSite?.domain,
									list_name: listName,
									blog_id: selectedSite?.ID,
								} );
							} }
						>
							{ __( 'Browse All' ) }
						</a>
					) }
					{ resultCount && <span className="plugins-results-header__action">{ resultCount }</span> }
				</div>
			) }
		</div>
	);
}

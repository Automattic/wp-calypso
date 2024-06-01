import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
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
}: {
	title: TranslateResult;
	subtitle: TranslateResult;
	browseAllLink?: string;
	resultCount?: string;
	className?: string;
	listName?: string;
} ) {
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );

	return (
		<div className={ classnames( 'plugins-results-header', className ) }>
			{ ( title || subtitle ) && (
				<div className="plugins-results-header__titles">
					{ title && <div className="plugins-results-header__title">{ title }</div> }
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

import { useI18n } from '@wordpress/react-i18n';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type BrowseAllActionProps = {
	browseAllLink?: string;
	className?: string;
	listName?: string;
};

const DEFAULT_ACTION_CLASS = 'plugins-results-header__action';

export default function BrowseAllAction( {
	browseAllLink,
	className,
	listName,
}: BrowseAllActionProps ) {
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );

	if ( ! browseAllLink ) {
		return null;
	}

	const handleBrowseAllClick = () => {
		recordTracksEvent( 'calypso_plugin_browser_all_click', {
			site: selectedSite?.domain,
			list_name: listName,
			blog_id: selectedSite?.ID,
		} );
	};

	const actionClassName = className
		? `${ DEFAULT_ACTION_CLASS } ${ className }`
		: DEFAULT_ACTION_CLASS;

	return (
		<a className={ actionClassName } href={ browseAllLink } onClick={ handleBrowseAllClick }>
			{ __( 'Browse all' ) }
		</a>
	);
}

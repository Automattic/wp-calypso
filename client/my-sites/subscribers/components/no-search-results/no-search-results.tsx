import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteTitle } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type NoSearchResultsProps = {
	searchTerm: string;
};

const NoSearchResults = ( { searchTerm }: NoSearchResultsProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, selectedSiteId ) );

	return (
		<div className="subscriber-list-container__no-results">
			{ translate( '0 subscribers found' ) }
			<p>
				{ translate( '“%(searchTerm)s” did not match any current subscribers.', {
					args: { searchTerm },
				} ) }
			</p>
			{ siteTitle && (
				<p>
					{ translate( 'Do you want to invite someone to join %(siteTitle)s?', {
						args: { siteTitle },
					} ) }
				</p>
			) }

			<p>
				{ translate( 'You can easily {{a}}import existing subscribers{{/a}}.', {
					components: {
						a: <a href="https://wordpress.com" target="_blank" rel="noopener noreferrer" />,
					},
				} ) }
			</p>
		</div>
	);
};

export default NoSearchResults;

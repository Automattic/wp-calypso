import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteTitle } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type NoSearchResultsProps = {
	searchTerm: string;
	setShowAddSubscribersModal: React.Dispatch< React.SetStateAction< boolean > >;
};

const NoSearchResults = ( { searchTerm, setShowAddSubscribersModal }: NoSearchResultsProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, selectedSiteId ) );

	return (
		<div className="no-search-results">
			<p className="no-search-results__heading">{ translate( '0 subscribers found' ) }</p>
			<p className="no-search-results__query">
				{ translate( '“%(searchTerm)s” did not match any current subscribers.', {
					args: { searchTerm },
					comment: '%(searchTerm)s is the search term the user entered.',
				} ) }
			</p>
			{ siteTitle && (
				<p>
					{ translate( 'Do you want to invite someone to join %(siteTitle)s?', {
						args: { siteTitle },
						comment: '%(siteTitle)s is the name of the site where the user is currently on.',
					} ) }
				</p>
			) }

			<p>
				{ translate( 'You can easily {{button}}import existing subscribers{{/button}}.', {
					components: {
						button: (
							<Button
								plain
								className="no-search-results__cta"
								onClick={ () => setShowAddSubscribersModal( true ) }
							/>
						),
					},
					comment: 'The button opens a modal where users can import their subscribers.',
				} ) }
			</p>
		</div>
	);
};

export default NoSearchResults;

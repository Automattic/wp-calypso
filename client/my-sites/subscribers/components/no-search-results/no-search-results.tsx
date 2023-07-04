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
				} ) }
			</p>
		</div>
	);
};

export default NoSearchResults;

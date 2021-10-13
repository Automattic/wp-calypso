/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { localize, useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { withInlineHelpSearchResults } from 'calypso/blocks/inline-help/data/use-inline-help-search-query';
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import './style.scss';

export function PopUpSearch( props ) {
	const translate = useTranslate();

	const onChildClick = ( e ) => e.stopPropagation();

	const mergeQueryParams = ( queryParamStatement1 = '', queryParamStatement2 = '' ) => {
		if ( queryParamStatement1 === '' && queryParamStatement2 !== '' ) {
			return queryParamStatement2;
		} else if ( queryParamStatement2 === '' && queryParamStatement1 !== '' ) {
			return queryParamStatement1;
		}
		return `${ queryParamStatement1 }&${ queryParamStatement2.slice( 1 ) }`;
	};

	const onResultClick = ( link ) => {
		props.onClose();
		const linkUrlObject = new URL( window.location.origin + link );
		const combinedQueryParams = mergeQueryParams( linkUrlObject.search, window.location.search );
		linkUrlObject.search = combinedQueryParams;

		window.location.href = localizeUrl( linkUrlObject.toString() );
	};
	return (
		<div role="button" className="popup-search__mask" onClick={ props.onClose }>
			<div className="popup-search__container" onClick={ onChildClick }>
				<HelpSearchCard
					query={ props.searchQuery }
					placeholder={ translate( 'Search wordpress actions' ) }
				/>
				{ props.searchResults.length > 0 && (
					<div className="popup-search__results" aria-label="Pop Up Search">
						{ props.searchResults.slice( 0, 10 ).map( ( { link, key, title, description } ) => (
							<div key={ title }>
								<div
									role="button"
									className="popup-search__result-single"
									key={ key }
									onClick={ () => onResultClick( link ) }
								>
									<div className="popup-search__results-cell">
										<h2>{ title }</h2>
										<em className="popup-search__description">{ description }</em>
									</div>
								</div>
							</div>
						) ) }
					</div>
				) }
			</div>
		</div>
	);
}

export default connect(
	( state ) => ( {
		searchQuery: getSearchQuery( state ),
	} ),
	{
		track: recordTracksEvent,
	}
)( localize( withInlineHelpSearchResults( PopUpSearch ) ) );

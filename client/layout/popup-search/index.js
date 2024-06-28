/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useHelpSearchQuery } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import './style.scss';

export default function PopUpSearch( { onClose } ) {
	const translate = useTranslate();
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const { data = [] } = useHelpSearchQuery( searchQuery );

	const searchResults = data.slice( 0, 5 );

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
		onClose();
		const linkUrlObject = new URL( link );
		const combinedQueryParams = mergeQueryParams( linkUrlObject.search, window.location.search );
		linkUrlObject.search = combinedQueryParams;

		window.location.href = localizeUrl( linkUrlObject.toString() );
	};
	return (
		<div role="button" className="popup-search__mask" onClick={ onClose }>
			<div className="popup-search__container" onClick={ onChildClick }>
				<HelpSearchCard
					searchQuery={ searchQuery }
					onSearch={ setSearchQuery }
					placeholder={ translate( 'Search wordpress actions' ) }
				/>
				{ searchResults.length > 0 && (
					<div className="popup-search__results" aria-label="Pop Up Search">
						{ searchResults.slice( 0, 10 ).map( ( { link, key, title, description } ) => (
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

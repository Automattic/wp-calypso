import React, { useState } from 'react';
import HelpfulArticles from './helpful-articles';

const HelpCenterContent = () => {
	const [ isSearching, setIsSearching ] = useState( false );
	console.log( 'CONTENTTT' );
	return (
		<div>
			{ /* <HelpSearch onSearch={ setIsSearching } /> */ }
			{ ! isSearching && (
				<div className="help__inner-wrapper">
					<HelpfulArticles />
					{ /* { getSupportLinks() } */ }
				</div>
			) }
		</div>
	);
};

export default HelpCenterContent;

/** @ssr-ready **/

import { isEnabled } from 'config';

const startDates = {
	stats: '2016-06-22',
};

if ( isEnabled( 'pages/first-view-prototype' ) ) {
	// this date will need to be changed before we release the pages FV
	startDates[ 'posts-pages' ] = '2020-01-01';
}

export const FIRST_VIEW_START_DATES = startDates;

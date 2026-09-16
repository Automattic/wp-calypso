import i18n from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { trackPageLoad, setPageTitle } from '../controller-helper';
import { FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX } from './constants';
import type { Context } from '@automattic/calypso-router';

const loadMain = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-four-for-four" */ 'calypso/reader/four-for-four'
	).then( ( module ) => ( { default: module.FourForFour } ) );

export function fourForFour( context: Context, next: () => void ) {
	const basePath = sectionify( context.path );
	const mcKey = 'four-for-four';

	trackPageLoad( basePath, 'Reader > 4 for 4', mcKey );

	recordTrack(
		`${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }loaded`,
		{ source: context.query?.source ?? '' },
		{ pathnameOverride: getCurrentRoute( context.store.getState() ) }
	);

	setPageTitle( context, i18n.translate( '4 for 4' ) );

	context.primary = <AsyncLoad require={ loadMain } placeholder={ null } />;
	next();
}

/**
 * External Dependencies
 */
import analytics from 'analytics';
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import { getABTestVariation } from 'lib/abtest';
import i18n from 'lib/mixins/i18n';
import plansList from 'lib/plans-list';
import productsList from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import sitesList from 'lib/sites-list';
import { setSection } from 'state/ui/actions';

const sites = sitesList(),
	plans = plansList(),
	products = productsList();

export default {
	isEligible: function( context, next ) {
		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			const selectedSite = sites.getSelectedSite();
			page.redirect( selectedSite ? `/plans/${ selectedSite.slug }` : '/plans' );
			return;
		}

		next();
	},

	startTrial: function( context ) {
		const StartTrial = require( './start-trial' ),
			FreeTrialCartData = require( './data/free-trial-cart' ),
			basePath = route.sectionify( context.path ),
			planName = context.params.planName;

		// removes the sidebar
		context.store.dispatch( setSection( null, { hasSidebar: false } ) );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		analytics.pageView.record( basePath, 'Start Trial' );
		analytics.tracks.recordEvent( 'calypso_start_trial_page_view', { planName } );

		titleActions.setTitle( i18n.translate( 'Free Trial' ), {
			siteID: context.params.site
		} );

		renderWithReduxStore(
			(
				<Main className="main-column">
					<div className="checkout start-trial">
						<FreeTrialCartData
							planName={ planName }
							products={ products }
							plans={ plans }
							sites={ sites } >
							<StartTrial
								sites={ sites }
								planName={ planName } />
						</FreeTrialCartData>
					</div>
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

/**
 * External Dependencies
 */
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';
import analytics from 'analytics';
import { renderWithReduxStore } from 'lib/react-helpers';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import sitesList from 'lib/sites-list';
import i18n from 'lib/mixins/i18n';
import titleActions from 'lib/screen-title/actions';
import plansList from 'lib/plans-list';
import productsList from 'lib/products-list';
import { getABTestVariation } from 'lib/abtest';
import Main from 'components/main';
import { setSection } from 'state/ui/actions';

const sites = sitesList(),
	plans = plansList(),
	products = productsList();

export default {
	isEligible: function( context, next ) {
		const selectedSite = sites.getSelectedSite();

		if ( ! selectedSite ) {
			page.redirect( '/plans' );
			return;
		}

		const hasTrial = selectedSite.plan.free_trial;

		if ( hasTrial || getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			page.redirect( `/plans/${ selectedSite.slug }` );
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

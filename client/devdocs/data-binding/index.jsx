/**
* External dependencies
*/
import React from 'react';
import Relay from 'react-relay';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

/**
 * Custom network layer that routes graphql queries to the 
 * correct WPCOM REST API endpoint
 */
class WpcomNetworkLayer {
	sendQueries(queryRequests) {
		return Promise.all(queryRequests.map(
			queryRequest => {
				wpcom.req.post( { path: '/graphql' }, { query: queryRequest.getQueryString() }, ( error, response ) => {
					if ( error ) {
						queryRequest.reject( error );
					}

					queryRequest.resolve( { response: response.data } );
				} );
			}
		));
	}

	sendMutation(mutationRequest) {
		// TODO
	}

	supports(...options) {
		// TODO
		return true;
	}
}

// configure Relay to use our network layer
Relay.injectNetworkLayer( new WpcomNetworkLayer() );

// the root component for our relay-managed mini-app
let App = React.createClass( {
	render() {
		console.log(this.props);
		var site = this.props.site;
		return <div>
			<h1>Site {site.url}</h1>
			<SitePlanContainer site={this.props.site}/>
		</div>;
	}
} );

//Components to render a site plan to demo composition
let SitePlan = React.createClass( {
	render() {
		return <h2>Plan: {this.props.site.plan.product_name_short}</h2>;
	}
} );

let SitePlanContainer = Relay.createContainer( SitePlan, { 
	fragments: {
		site: () => Relay.QL`
			fragment on Site {
				plan {
					id
					product_name_short	
				}
			}
		`
	}
} );

// the container for the mini-app which injects the site object
// the fragment any container should compose the fragments of
// any of its immediate children - not necessarily intuitive, feels
// like unnecessary duplication to me, but I guess offers flexibility
let AppContainer = Relay.createContainer( App, {
	fragments: {
		site: () => Relay.QL`
			fragment on Site {
				id,
				name,
				url,
				${SitePlanContainer.getFragment('site')}
			}
		`
	},
} );

// the default route - in the real world you'd probably 
// have a user (in Relay parlance, viewer) as the root, not a site
class AppRoute extends Relay.Route {};
AppRoute.queries = {
	// query for jetpack site goldsounds.com
    site: () => Relay.QL`
      query { site(id: $siteID) }
    `
};
AppRoute.paramDefinitions = {
	siteID: {required: true},
};
AppRoute.routeName = 'AppRoute';

/**
 * a root component which creates a Relay-managed container
 * that wraps our root component and route
 */
export default React.createClass( {
	displayName: 'DataBinding',
	render() {
		return <Relay.RootContainer
    			Component={AppContainer}
    			route={new AppRoute( { siteID: 88276458 } )}
    			renderLoading={ function() { return <h1>Loading</h1>; } }
    			renderFailure={ function(error, retry) {
					return (
						<div>
							<p>{error.message}</p>
							<p><button onClick={retry}>Retry?</button></p>
						</div>
					);
				} }
    			/>;
	}
} );
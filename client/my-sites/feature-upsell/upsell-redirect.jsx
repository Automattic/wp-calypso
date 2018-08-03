/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentPlan, hasFeature } from 'state/sites/plans/selectors';
import { abtest } from 'lib/abtest';
import config from 'config';

export class Wrapper extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		ComponentClass: PropTypes.any.isRequired,
		upsellPageURL: PropTypes.string.isRequired,
		shouldRedirectToUpsellPage: PropTypes.bool.isRequired,
		loadingPlan: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		this.goToUpsellPageIfRequired();
	}

	getSnapshotBeforeUpdate() {
		this.goToUpsellPageIfRequired();
	}

	goToUpsellPageIfRequired() {
		const props = this.props;
		if ( this.shouldRedirectToUpsellPage() ) {
			page.redirect( `${ props.upsellPageURL }/${ props.siteSlug }` );
		}
	}

	shouldRedirectToUpsellPage() {
		const props = this.props;
		return props.shouldRedirectToUpsellPage && ! props.loadingPlan;
	}

	render() {
		const { ComponentClass, loadingPlan, shouldRedirectToUpsellPage, ...props } = this.props;
		if ( loadingPlan || this.shouldRedirectToUpsellPage() ) {
			return false;
		}

		return <ComponentClass { ...props } />;
	}
}

export const createMapStateToProps = (
	ComponentClass,
	requiredFeature,
	upsellPageURL
) => state => {
	const siteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, siteId );
	const shouldRedirectToUpsellPage =
		config.isEnabled( 'upsell/nudge-a-palooza' ) &&
		abtest( 'nudgeAPalooza' ) === 'customPluginAndThemeLandingPages' &&
		! hasFeature( state, siteId, requiredFeature );

	return {
		siteId,
		ComponentClass,
		upsellPageURL,
		shouldRedirectToUpsellPage,
		loadingPlan: ! currentPlan,
	};
};

export const upsellRedirect = ( requiredFeature, upsellPageURL ) => {
	return ComponentClass => {
		const mapStateToProps = createMapStateToProps( ComponentClass, requiredFeature, upsellPageURL );
		return connect( mapStateToProps )( Wrapper );
	};
};

export default upsellRedirect;

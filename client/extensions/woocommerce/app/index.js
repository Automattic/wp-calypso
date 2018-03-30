/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	canCurrentUser,
	isSiteAutomatedTransfer,
	hasSitePendingAutomatedTransfer,
} from 'state/selectors';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import WooCommerceColophon from 'woocommerce/components/woocommerce-colophon';

class App extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		documentTitle: PropTypes.string,
		canUserManageOptions: PropTypes.bool.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		hasPendingAutomatedTransfer: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
	};

	componentDidMount = () => {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchSetupChoices( siteId );
		}
	};

	componentWillReceiveProps( newProps ) {
		if ( this.props.children !== newProps.children ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentDidUpdate( prevProps ) {
		const { siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		if ( siteId && oldSiteId !== siteId ) {
			this.props.fetchSetupChoices( siteId );
		}
	}

	redirect = () => {
		window.location.href = '/stats/day';
	};

	render = () => {
		const {
			siteId,
			children,
			canUserManageOptions,
			isAtomicSite,
			hasPendingAutomatedTransfer,
			translate,
		} = this.props;
		if ( ! siteId ) {
			return null;
		}

		if (
			! isAtomicSite &&
			! hasPendingAutomatedTransfer &&
			! config.isEnabled( 'woocommerce/store-on-non-atomic-sites' )
		) {
			this.redirect();
			return null;
		}

		if ( ! canUserManageOptions ) {
			this.redirect();
			return null;
		}

		const documentTitle = this.props.documentTitle || translate( 'Store' );

		const className = 'woocommerce';
		return (
			<div className={ className }>
				<DocumentHead title={ documentTitle } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ children }
				<WooCommerceColophon />
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const canUserManageOptions =
		( siteId && canCurrentUser( state, siteId, 'manage_options' ) ) || false;
	const isAtomicSite = ( siteId && !! isSiteAutomatedTransfer( state, siteId ) ) || false;
	const hasPendingAutomatedTransfer =
		( siteId && !! hasSitePendingAutomatedTransfer( state, siteId ) ) || false;

	return {
		siteId,
		canUserManageOptions,
		isAtomicSite,
		hasPendingAutomatedTransfer,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( App ) );

/**
 * External depedencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { fetchCoupons } from 'woocommerce/state/sites/coupons/actions';
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class Promotions extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} )
	};

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchCoupons( site.ID, { page: 1 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;
		if ( oldSiteId !== newSiteId ) {
			// TODO: Fill in with current page number.
			this.props.fetchCoupons( newSiteId, { page: 1 } );
		}
	}

	render() {
		const { site, className, translate } = this.props;
		const classes = classNames( 'promotions__list', className );

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Promotions' ) }</span> ) }>
					<Button primary href={ getLink( '/store/promotion/:site/', site ) }>
						{ translate( 'Add promotion' ) }
					</Button>
				</ActionHeader>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );

	return {
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchCoupons,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Promotions ) );

/**
 * External depedencies
 *
 * @format
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchPromotions } from 'woocommerce/state/sites/promotions/actions';
import { getPromotions } from 'woocommerce/state/selectors/promotions';
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PromotionsList from './promotions-list';
import SearchCard from 'components/search-card';

class Promotions extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		promotions: PropTypes.array,
		fetchPromotions: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchPromotions( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPromotions( newSiteId );
		}
	}

	renderSearchCard() {
		const { site, promotions, translate } = this.props;

		// TODO: Implement onSearch
		return (
			<SearchCard
				onSearch={ noop }
				delaySearch
				delayTimeout={ 400 }
				disabled={ ! site || ! promotions }
				placeholder={ translate( 'Search promotions…' ) }
			/>
		);
	}

	render() {
		const { site, className, translate } = this.props;
		const classes = classNames( 'promotions__list', className );

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ <span>{ translate( 'Promotions' ) }</span> }>
					<Button primary href={ getLink( '/store/promotion/:site/', site ) }>
						{ translate( 'Add promotion' ) }
					</Button>
				</ActionHeader>
				{ this.renderSearchCard() }
				<PromotionsList />
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const promotions = getPromotions( state, site.ID );

	return {
		site,
		promotions,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPromotions,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Promotions ) );

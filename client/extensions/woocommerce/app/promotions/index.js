/**
 * External depedencies
 *
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
import EmptyContent from 'calypso/components/empty-content';
import { fetchPromotions } from 'woocommerce/state/sites/promotions/actions';
import { getPromotions } from 'woocommerce/state/selectors/promotions';
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';
import { setPromotionSearch } from 'woocommerce/state/ui/promotions/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'calypso/components/main';
import PromotionsList from './promotions-list';
import SearchCard from 'calypso/components/search-card';

class Promotions extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		promotions: PropTypes.array,
		fetchPromotions: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
	}

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchPromotions( site.ID );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPromotions( newSiteId );
		}
	}

	renderSearchCard() {
		const { site, promotions, translate } = this.props;

		return (
			<SearchCard
				onSearch={ this.props.setPromotionSearch }
				delaySearch
				delayTimeout={ 400 }
				disabled={ ! site || ! promotions }
				placeholder={ translate( 'Search promotions…' ) }
			/>
		);
	}

	renderEmptyContent() {
		const { site, translate } = this.props;

		const emptyContentAction = (
			<Button href={ getLink( '/store/promotion/:site/', site ) }>
				{ translate( 'Add a promotion!' ) }
			</Button>
		);

		return (
			<EmptyContent
				title={ translate( "You don't have any promotions." ) }
				action={ emptyContentAction }
			/>
		);
	}

	renderContent() {
		return (
			<div>
				{ this.renderSearchCard() }
				<PromotionsList />
			</div>
		);
	}

	render() {
		const { site, className, promotions, translate } = this.props;
		const classes = classNames( 'promotions__list', className );
		const isEmpty = site && promotions && 0 === promotions.length;

		const content = isEmpty ? this.renderEmptyContent() : this.renderContent();

		return (
			<Main className={ classes } wideLayout>
				<ActionHeader breadcrumbs={ <span>{ translate( 'Promotions' ) }</span> }>
					<Button primary href={ getLink( '/store/promotion/:site/', site ) }>
						{ translate( 'Add promotion' ) }
					</Button>
				</ActionHeader>
				{ content }
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
			setPromotionSearch,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Promotions ) );

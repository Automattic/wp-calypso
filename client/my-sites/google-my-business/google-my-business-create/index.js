/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Animation from './animation';
import SearchForALocation from '../search-for-a-location';
import Address from '../google-my-business-address';
import Category from '../google-my-business-category';
import Connections from '../google-my-business-connections';
import Confirm from '../google-my-business-confirm';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import StepNavigation from '../step-navigation';
import { TransitionGroup } from 'react-transition-group';

class GoogleMyBusinessCreate extends Component {
	static paths = {
		search: {
			component: SearchForALocation,
			next: '/google-my-business/create/address/',
			back: '/google-my-business/',
			value: 10,
		},
		address: {
			component: Address,
			next: '/google-my-business/create/category/',
			back: '/google-my-business/create/search/',
			value: 30,
		},
		category: {
			component: Category,
			next: '/google-my-business/create/connections/',
			back: '/google-my-business/create/address/',
			value: 50,
		},
		connections: {
			component: Connections,
			next: '/google-my-business/create/confirm/',
			back: '/google-my-business/create/category/',
			value: 70,
		},
		confirm: {
			component: Confirm,
			next: '/google-my-business/verify/',
			back: '/google-my-business/create/connections/',
			value: 100,
		},
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	getStep() {
		const { path, siteId } = this.props;
		const currentPath = GoogleMyBusinessCreate.paths[ path ];
		const StepComponent = currentPath ? currentPath.component : null;

		return (
			<Animation key={ path } path={ path } in={ true }>
				<StepComponent siteId={ siteId } />
			</Animation>
		);
	}

	render() {
		const { path, siteId, translate } = this.props;
		const currentPath = GoogleMyBusinessCreate.paths[ path ];
		const backHref = currentPath ? currentPath.back + siteId : null;
		const nextHref = currentPath ? currentPath.next + siteId : null;
		const value = currentPath ? currentPath.value : null;

		return (
			<Main className="google-my-business-create google-my-business" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>
				<TransitionGroup>{ this.getStep() }</TransitionGroup>
				<StepNavigation value={ value } total={ 100 } backHref={ backHref } nextHref={ nextHref } />
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessCreate ) );

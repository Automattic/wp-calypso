/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Bluehost from './bluehost';
import ErrorNotice from './error-notice';
import SiteGround from './siteground';
import Pressable from './pressable';
import SectionHeader from 'components/section-header';
import { guidedTransferItem } from 'lib/cart-values/cart-items';
import { addItem } from 'lib/cart/actions';
import page from 'page';
import { saveHostDetails } from 'state/sites/guided-transfer/actions';
import {
	isGuidedTransferSavingHostDetails,
	isGuidedTransferAwaitingPurchase,
} from 'state/sites/guided-transfer/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class HostCredentialsPage extends Component {
	static propTypes = {
		hostSlug: PropTypes.string.isRequired,
	};

	state = { fieldValues: {} };

	setFieldValue = ( fieldName, fieldValue ) => {
		this.setState( {
			fieldValues: {
				...this.state.fieldValues,
				[ fieldName ]: fieldValue,
			},
		} );
	};

	onFieldChange = ( fieldName ) => ( e ) => {
		this.setFieldValue( fieldName, e.target.value );
	};

	redirectToCart = () => {
		addItem( guidedTransferItem() );
		page.redirect( `/checkout/${ this.props.siteSlug }` );
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.isAwaitingPurchase ) {
			this.redirectToCart();
		}
	}

	submit = () => {
		const payload = {
			...this.state.fieldValues,
			host_slug: this.props.hostSlug,
		};

		this.props.submit( payload );
	};

	getHostForm() {
		const props = {
			onFieldChange: this.onFieldChange,

			fieldValues: this.state.fieldValues,
			hostInfo: this.props.hostInfo,

			submit: this.submit,
			isSubmitting: this.props.isSubmitting,
		};

		switch ( this.props.hostSlug ) {
			case 'bluehost':
				return <Bluehost { ...props } />;
			case 'siteground':
				return <SiteGround { ...props } />;
			case 'pressable':
				return <Pressable { ...props } />;
		}

		return null;
	}

	render() {
		return (
			<div>
				<ErrorNotice />
				<SectionHeader label={ this.props.translate( 'Account Info' ) } />
				{ this.getHostForm() }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	isSubmitting: isGuidedTransferSavingHostDetails( state, siteId ),
	isAwaitingPurchase: isGuidedTransferAwaitingPurchase( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	submit: ( data ) => dispatch( saveHostDetails( siteId, data ) ),
} );

export default localize( connect( mapStateToProps, mapDispatchToProps )( HostCredentialsPage ) );

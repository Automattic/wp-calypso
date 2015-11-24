/**
 * External Dependencies
 **/
import isEqual from 'lodash/lang/isEqual';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 **/
import Card from 'components/card';
import loadEndpointForm from './load-endpoint-form';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import notices from 'notices';
import paths from 'me/purchases/paths';
import purchasesMixin from '../purchases-mixin';

const ConfirmCancelPurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.object
	},

	mixins: [ purchasesMixin ],

	componentDidMount() {
		if ( ! this.props.selectedPurchase.hasLoadedFromServer || ! this.props.selectedSite ) {
			return;
		}

		this.resetEndpointForm();
	},

	componentDidUpdate( prevProps ) {
		if ( ! this.props.selectedPurchase.hasLoadedFromServer ) {
			return;
		}

		if ( isEqual( prevProps.selectedPurchase.data, this.props.selectedPurchase.data ) &&
				( prevProps.selectedSite.ID === this.props.selectedSite.ID ) ) {
			return;
		}

		this.resetEndpointForm();
	},

	resetEndpointForm() {
		const { selectedSite, selectedPurchase } = this.props;

		loadEndpointForm( {
			container: React.findDOMNode( this.refs.root ),
			selectedSite,
			selectedPurchase: selectedPurchase.data,
			onSubmit: this.handleSubmit
		} );
	},

	handleSubmit( error, response ) {
		if ( error ) {
			notices.error( error.message );
			return;
		}

		notices.success( response.message, { persistent: true } );
		page.redirect( paths.list() );
	},

	renderCard() {
		return <Card><div ref="root">{ this.translate( 'Loading…' ) }</div></Card>;
	},

	render() {
		return (
			<Main className="cancel-confirm">
				<HeaderCake onClick={ this.goToManagePurchase }>{ this.translate( 'Confirm Cancellation' ) }</HeaderCake>
				{ this.renderCard() }
			</Main>
		);
	}
} );

export default ConfirmCancelPurchase;

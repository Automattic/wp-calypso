/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoading,
	getOptedOutOfShippingSetup,
	getOptedOutofTaxesSetup,
	getTriedCustomizerDuringInitialSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import {
	getTotalProducts
} from 'woocommerce/state/sites/products/selectors';
import {
	fetchProducts
} from 'woocommerce/state/sites/products/actions';
import {
	fetchSetupChoices,
	setOptedOutOfShippingSetup,
	setOptedOutOfTaxesSetup,
	setTriedCustomizerDuringInitialSetup,
} from 'woocommerce/state/sites/setup-choices/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import SetupTask from './setup-task';

class SetupTasks extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		this.state = {
			showShippingTask: props.loading || ! props.optedOutOfShippingSetup,
			showTaxesTask: props.loading || ! props.optedOutOfTaxesSetup,
		};
	}

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSetupChoices( site.ID );
			this.props.fetchProducts( site.ID, 1 );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
		}
	}

	onClickNoShip = ( event ) => {
		event.preventDefault();
		this.setState( {
			showShippingTask: false
		} );
		this.props.setOptedOutOfShippingSetup( this.props.site.ID, true );
	}

	onClickNoTaxes = () => {
		event.preventDefault();
		this.setState( {
			showTaxesTask: false
		} );
		this.props.setOptedOutOfTaxesSetup( this.props.site.ID, true );
	}

	getSetupTasks = () => {
		const {
			site,
			triedCustomizer,
			hasProducts,
			paymentsAreSetUp,
			shippingIsSetUp,
			taxesAreSetUp,
			translate
		} = this.props;

		return [
			{
				checked: hasProducts,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Add your products to your store.' ),
				label: translate( 'Add a product' ),
				show: true,
				actions: [
					{
						label: 'Add a product',
						path: getLink( '/store/product/:site', site ),
					}
				]
			},
			{
				checked: shippingIsSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Configure the locations to which you ship your products.' ),
				label: translate( 'Set up shipping' ),
				show: this.state.showShippingTask,
				actions: [
					{
						label: translate( 'Set up shipping' ),
						path: getLink( '/store/settings/shipping/:site', site ),
					},
					{
						label: translate( 'I won\'t be shipping' ),
						isSecondary: true,
						onClick: this.onClickNoShip
					}
				]
			},
			{
				checked: paymentsAreSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Choose which payment methods to offer your customers.' ),
				label: translate( 'Set up payments' ),
				show: true,
				actions: [
					{
						label: translate( 'Set up payments' ),
						path: getLink( '/store/settings/payments/:site', site ),
					}
				]
			},
			{
				checked: taxesAreSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Configure how tax rates are calculated at your store.' ),
				label: translate( 'Set up taxes' ),
				show: this.state.showTaxesTask,
				actions: [
					{
						label: translate( 'Set up taxes' ),
						path: getLink( '/store/settings/taxes/:site', site ),
					},
					{
						label: translate( 'I\'m not charging sales tax' ),
						isSecondary: true,
						onClick: this.onClickNoTaxes
					}
				]
			},
			{
				checked: triedCustomizer,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'View your store, test your settings and customize the design.' ),
				label: translate( 'View and customize' ),
				show: true,
				actions: [
					{
						label: translate( 'Customize' ),
						path: getLink( 'https://:site/wp-admin/customize.php?return=%2Fwp-admin%2F', site ),
						// TODO use onClick here instead in order to hit setTriedCustomizerDuringInitialSetup
					}
				]
			}
		];
	}

	renderSetupTask = ( setupTask, index ) => {
		if ( ! setupTask.show ) {
			return null;
		}

		return (
			<SetupTask
				actions={ setupTask.actions }
				checked={ setupTask.checked }
				docURL= { setupTask.docURL }
				explanation={ setupTask.explanation }
				key={ index }
				label={ setupTask.label }
			/>
		);
	}

	render = () => {
		return (
			<div className="dashboard__setup-checklist">
				{ this.getSetupTasks().map( this.renderSetupTask ) }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		loading: areSetupChoicesLoading( state ),
		optedOutOfShippingSetup: getOptedOutOfShippingSetup( state ),
		optedOutOfTaxesSetup: getOptedOutofTaxesSetup( state ),
		triedCustomizer: getTriedCustomizerDuringInitialSetup( state ),
		hasProducts: getTotalProducts( state ) > 0,
		// TODO - connect the following to selectors when they become available
		paymentsAreSetUp: false,
		shippingIsSetUp: false,
		taxesAreSetUp: false,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchProducts,
			fetchSetupChoices,
			setOptedOutOfShippingSetup,
			setOptedOutOfTaxesSetup,
			setTriedCustomizerDuringInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupTasks ) );

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { getLink } from '../../lib/nav-utils';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';
import SetupTask from './setup-task';

class Setup extends Component {
	static propTypes = {
		onFinished: PropTypes.func,
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
		} ),
		storeHasBeenCustomized: PropTypes.bool,
		storeHasProducts: PropTypes.bool,
		storePaymentsAreSetUp: PropTypes.bool,
		storeShippingIsSetUp: PropTypes.bool,
		storeTaxesAreSetUp: PropTypes.bool,
	};

	// TODO - replace with props mapped from state when this info becomes available in state
	static defaultProps = {
		storeHasBeenCustomized: true,
		storeHasProducts: false,
		storePaymentsAreSetUp: false,
		storeShippingIsSetUp: false,
		storeTaxesAreSetUp: false,
	}

	state = {
		showShippingTask: true,
		showTaxesTask: true,
	}

	onClickNoShip = ( event ) => {
		event.preventDefault();
		this.setState( {
			showShippingTask: false
		} );
		// TODO - dispatch an action to record the user preference at WordPress.com
	}

	onClickNoTaxes = () => {
		event.preventDefault();
		this.setState( {
			showTaxesTask: false
		} );
		// TODO - dispatch an action to record the user preference at WordPress.com
	}

	getSetupTasks = () => {
		const {
			site,
			storeHasBeenCustomized,
			storeHasProducts,
			storePaymentsAreSetUp,
			storeShippingIsSetUp,
			storeTaxesAreSetUp,
			translate
		} = this.props;

		return [
			{
				checked: storeHasProducts,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Add products one at a time or import many in a single import.' ),
				label: translate( 'Add a product' ),
				show: true,
				actions: [
					{
						label: translate( 'Import' ),
						path: getLink( '/store/products/:site/import', site ),
						slug: 'add-products-import',
					},
					{
						label: 'Add a product',
						path: getLink( '/store/products/:site/add', site ),
					}
				]
			},
			{
				checked: storeShippingIsSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Configure the locations to which you ship your products.' ),
				label: translate( 'Set up shipping' ),
				show: this.state.showShippingTask,
				actions: [
					{
						label: translate( 'Set up shipping' ),
						path: getLink( '/store/settings/:site/shipping', site ),
					},
					{
						label: translate( 'I won\'t be shipping' ),
						isSecondary: true,
						onClick: this.onClickNoShip
					}
				]
			},
			{
				checked: storePaymentsAreSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Choose which payment methods to offer your customers.' ),
				label: translate( 'Set up payments' ),
				show: true,
				actions: [
					{
						label: translate( 'Set up payments' ),
						path: getLink( '/store/settings/:site/payments', site ),
					}
				]
			},
			{
				checked: storeTaxesAreSetUp,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'Configure how tax rates are calculated at your store.' ),
				label: translate( 'Set up taxes' ),
				show: this.state.showTaxesTask,
				actions: [
					{
						label: translate( 'Set up taxes' ),
						path: getLink( '/store/settings/:site/tax', site ),
					},
					{
						label: translate( 'I\'m not charging sales tax' ),
						isSecondary: true,
						onClick: this.onClickNoTaxes
					}
				]
			},
			{
				checked: storeHasBeenCustomized,
				docURL: 'https://support.wordpress.com/',
				explanation: translate( 'View your store, test your settings and customize the design.' ),
				label: translate( 'View and customize' ),
				show: true,
				actions: [
					{
						label: translate( 'Customize' ),
						path: getLink( 'https://:site/wp-admin/customize.php?return=%2Fwp-admin%2F', site ),
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
		const { onFinished, translate } = this.props;
		const tasks = this.getSetupTasks();
		const allTasksCompleted = tasks.every( task => task.checked );

		return (
			<div className="card dashboard__setup-wrapper">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Howdy! Let\'s set up your store & start selling' ) }
					subtitle={ translate( 'Below you will find the essential tasks to complete before making your store live.' ) }
				/>
				{ tasks.map( this.renderSetupTask ) }
				<SetupFooter
					onClick={ onFinished }
					label={ translate( 'I\'m finished setting up' ) }
					primary={ allTasksCompleted }
				/>
			</div>
		);
	}
}

export default localize( Setup );

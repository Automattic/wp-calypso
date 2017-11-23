/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchEmailSettings } from 'woocommerce/state/sites/settings/email/actions';
import {
	getEmailSettings,
	areEmailSettingsLoading,
	areEmailSettingsLoaded,
} from 'woocommerce/state/sites/settings/email/selectors';
import CustomerNotification from './components/customer-notification';
import ExtendedHeader from 'woocommerce/components/extended-header';
import InternalNotification from './components/internal-notification';
import NotificationsOrigin from './components/notifications-origin';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';

const fromName =
	{
		field: 'woocommerce_email_from_address',
		title: translate( 'From name' ),
		subtitle: translate( 'Emails will appear in recipients inpboxses \'from\' this name.' ),
	};
const fromAddress =
	{
		field: 'woocommerce_email_from_name',
		title: translate( 'From address' ),
		subtitle: translate( 'If recipients reply to store emails they will be sent to this address.' ),
	};

const internalNotifications = [
	{
		field: 'email_new_order',
		title: translate( 'New order' ),
		subtitle: translate( 'Sent when a new order is received.' ),
	},
	{
		field: 'email_cancelled_order',
		title: translate( 'Cancelled order' ),
		subtitle: translate( 'Sent when a new order is marked \'cancelled\'.' ),
	},
	{
		field: 'email_failed_order',
		title: translate( 'Failed order' ),
		subtitle: translate( 'Sent when a new order is marked \'failed\'.' ),
	},
];

// id enabled
const customerNotifications = [
	{
		field: 'email_customer_on_hold_order',
		title: translate( 'Order pending payment' ),
		subtitle: translate( 'Sent when an order is marked \'payment pending\'.' ),
	},
	{
		field: 'email_customer_processing_order',
		title: translate( 'Processing order' ),
		subtitle: translate( 'Sent when an order is marked \'payment processing\'.' ),
	},
	{
		field: 'email_customer_completed_order',
		title: translate( 'Completed order' ),
		subtitle: translate( 'Sent when an order is marked \'paid in full\'.' ),
	},
	{
		field: 'email_customer_refunded_order',
		title: translate( 'Refunded order' ),
		subtitle: translate( 'Sent when an order is marked \'payment refunded\'.' ),
	},
	{
		field: 'email_customer_new_account',
		title: translate( 'Refunded order' ),
		subtitle: translate( 'Sent when an order is marked \'payment refunded\'.' ),
	},
];

class Settings extends React.Component {

	constructor( props ) {
		super( props );
	}

	fetchSettings = ( props ) => {
		const { siteId, fetchSettings } = props;
		siteId && fetchSettings( siteId );
	}

	componentDidMount = () => {
		this.fetchSettings( this.props );
	};

	componentWillReceiveProps = newProps => {
		if ( newProps.siteId !== this.props.siteId ) {
			this.fetchSettings( newProps );
		}
	};

	notificationsToggle = () => {
		undefined;
	}

	recipientsChange = () => {
		undefined;
	}

	renderInternalNotification = ( item, index ) => {
		const { settings, loaded } = this.props;
		return <InternalNotification
			key={ index }
			item={ item }
			checked={ 'yes' === ( loaded && settings[ item.field ].enabled ) }
			recipient={ loaded ? settings[ item.field ].recipient : '' }
			isPlaceholder={ ! loaded }
			onToggle={ this.notificationsToggle }
			onChange={ this.recipientsChange }
		/>;
	}

	renderCustomerNotification = ( item, index ) => {
		const { settings, loaded } = this.props;
		return <CustomerNotification
			key={ index }
			item={ item }
			isPlaceholder={ ! loaded }
			checked={ 'yes' === ( loaded && settings[ item.field ].enabled ) }
			onToggle={ this.notificationsToggle }
		/>;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const { loaded, settings } = this.props;

		return (
			<div className="email-settings__container">
				<List className="email-settings__origin">
					<ExtendedHeader
						label={ translate( 'Origin' ) }
					/>
					<NotificationsOrigin
						item={ fromName }
						isPlaceholder={ ! loaded }
						recipient={ loaded ? settings.email[ fromName.field ] : '' }
						onChange={ this.recipientsChange }
					/>
					<NotificationsOrigin
						item={ fromAddress }
						isPlaceholder={ ! loaded }
						recipient={ loaded ? settings.email[ fromAddress.field ] : '' }
						onChange={ this.recipientsChange }
					/>
				</List>
				<div className="email-settings__internal-notifications">
					<ExtendedHeader
						label={ translate( 'Internal notifications' ) }
						description={ translate( 'Email notifications sent to store staff.' ) }
					/>
					<List>
						<ListHeader>
							<ListItemField className="shipping-zone__location-title">
								{ translate( 'Email' ) }
							</ListItemField>
							<ListItemField className="shipping-zone__location-summary">
								{ translate( 'Recipients (comma separated)' ) }
							</ListItemField>
							<ListItemField className="shipping-zone__location-summary">
								{ translate( 'Enabled' ) }
							</ListItemField>
						</ListHeader>
						{ internalNotifications.map( this.renderInternalNotification ) }
					</List>
				</div>
				<div className="email-settings__customer-notifications">
					<ExtendedHeader
						label={ translate( 'Customer notifications' ) }
						description={ translate( 'Email notifications sent to your customers.' ) }
					/>
					<List>
						<ListHeader>
							<ListItemField className="shipping-zone__location-title">
								{ translate( 'Email' ) }
							</ListItemField>
							<ListItemField className="shipping-zone__location-summary">
								{ translate( 'Enabled' ) }
							</ListItemField>
						</ListHeader>
						{ customerNotifications.map( this.renderCustomerNotification ) }
					</List>
				</div>
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

Settings.propTypes = {
	siteId: PropTypes.number.isRequired,
	fetchSettings: PropTypes.func.isRequired,
	settings: PropTypes.object,
	loading: PropTypes.bool,
};

function mapStateToProps( state, props ) {
	return {
		settings: areEmailSettingsLoaded( state, props.siteId )
			? getEmailSettings( state, props.siteId ) : {},
		loading: areEmailSettingsLoading( state, props.siteId ),
		loaded: areEmailSettingsLoaded( state, props.siteId ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettings: fetchEmailSettings,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( Settings );

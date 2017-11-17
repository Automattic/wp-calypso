/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchEmailSettings } from 'woocommerce/state/sites/settings/email/actions';
import {
<<<<<<< HEAD
	fetchEmailSettings,
} from 'woocommerce/state/sites/settings/email/actions';
=======
	getEmailSettings,
	areEmailSettingsLoading,
	areEmailSettingsLoaded,
} from 'woocommerce/state/sites/settings/email/selectors';
import Card from 'components/card';
import CustomerNotification from './components/customer-notification';
import InternalNotification from './components/internal-notification';
import NotificationsOrigin from './components/notifications-origin';

const fromName =
	{
		field: 'woocommerce_email_from_address',
		title: '',
		subtitle: '',
	};

const fromAddress =
	{
		field: 'woocommerce_email_from_name',
		title: '',
		subtitle: '',
	};

const internalNotifications = [
	{
		field: 'email_new_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_cancelled_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_failed_order',
		title: '',
		subtitle: '',
	},
];

// id enabled
const customerNotifications = [
	{
		field: 'email_customer_on_hold_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_customer_processing_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_customer_completed_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_customer_refunded_order',
		title: '',
		subtitle: '',
	},
	{
		field: 'email_customer_new_account',
		title: '',
		subtitle: '',
	},
];
>>>>>>> Add first pass of email settings UI

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

<<<<<<< HEAD
=======
	recipientsChange = () => {
		undefined;
	}

>>>>>>> Add first pass of email settings UI
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const { loading, loaded, settings } = this.props;
		const waiting = ! loaded || loading;

		return (
			<div className="email-settings__container">
				<div className="email-settings__origin">
					<Card className="email-settings__origin-title">
						Origin
					</Card>
					<Card className="email-settings__origin-settings">
						{ waiting && <p className="email-settings__loading" /> }
						{ loaded && <NotificationsOrigin
								item={ fromName }
								recipient={ settings.email[ fromName.field ] }
								onChange={ this.recipientsChange }
							/> }
						{ waiting && <p className="email-settings__loading" /> }
						{ loaded && <NotificationsOrigin
								item={ fromAddress }
								recipient={ settings.email[ fromAddress.field ] }
								onChange={ this.recipientsChange }
							/> }
					</Card>
				</div>
				<div className="email-settings__internal-notifications">
					<Card className="email-settings__internal-notifications-title">
						Internal notifications
					</Card>
					<Card className="email-settings__internal-notifications-legend">
						<span>
							Email
						</span>
						<span>
							Recipients (comma separated)
						</span>
						<span>
							Enabled
						</span>
					</Card>
					<Card className="email-settings__internal-notifications-settings">
					{
							internalNotifications.map( ( item, index ) => {
								if ( waiting ) {
									return <p key={ index } className="email-settings__loading" />;
								}
								return (
									<InternalNotification
										key={ index }
										item={ item }
										checked={ 'yes' === settings[ item.field ].enabled }
										recipient={ settings[ item.field ].recipient }
										onToggle={ this.notificationsToggle }
										onChange={ this.recipientsChange }
									/>
								);
							} )
						}
					</Card>
				</div>
				<div className="email-settings__customer-notifications">
					<Card className="email-settings__customer-notifications-title">
						Customer notifications
					</Card>
					<Card className="email-settings__customer-notifications-legend">
						<span>
							Email
						</span>
						<span>
							Enabled
						</span>
					</Card>
					<Card className="email-settings__customer-notifications-settings">
						{
							customerNotifications.map( ( item, index ) => {
								if ( waiting ) {
									return <p key={ index } className="email-settings__loading" />;
								}
								return (
									<CustomerNotification
										key={ index }
										item={ item }
										checked={ 'yes' === settings[ item.field ].enabled }
										onToggle={ this.notificationsToggle }
									/>
								);
							} )
						}
					</Card>
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( Settings ) );

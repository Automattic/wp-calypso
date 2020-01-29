/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { dropRightWhile, negate, identity } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import CustomNameserversRow from './custom-nameservers-row';
import { change, remove } from 'lib/domains/nameservers';
import Notice from 'components/notice';
import { CHANGE_NAME_SERVERS, CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

const MIN_NAMESERVER_LENGTH = 2;
const MAX_NAMESERVER_LENGTH = 4;

class CustomNameserversForm extends React.PureComponent {
	static propTypes = {
		nameservers: PropTypes.array,
		onChange: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		submitDisabled: PropTypes.bool.isRequired,
	};

	warning() {
		const { translate } = this.props;

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					'Your domain must use WordPress.com name servers for your ' +
						'WordPress.com site to load & other features to be available.'
				) }{ ' ' }
				<a
					href={ CHANGE_NAME_SERVERS }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.handleLearnMoreClick }
				>
					{ translate( 'Learn more.' ) }
				</a>
			</Notice>
		);
	}

	handleLearnMoreClick = () => {
		this.props.customNameServersLearnMoreClick( this.props.selectedDomainName );
	};

	popularHostsMessage() {
		const { translate } = this.props;

		return (
			<div className="name-servers__custom-nameservers-form-explanation">
				{ translate( 'Not sure what name servers to use?' ) }{ ' ' }
				<a
					href={ CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.handleLookUpClick }
				>
					{ translate( 'Look up the name servers for popular hosts.' ) }
				</a>
			</div>
		);
	}

	handleLookUpClick = () => {
		this.props.customNameServersLookUpClick( this.props.selectedDomainName );
	};

	rows() {
		// Remove the empty values from the end, and add one empty one
		const { translate } = this.props;
		const nameservers = dropRightWhile( this.props.nameservers, negate( identity ) );

		if ( nameservers.length < MAX_NAMESERVER_LENGTH ) {
			nameservers.push( '' );
		}

		while ( nameservers.length < MIN_NAMESERVER_LENGTH ) {
			// Ensure there are at least 2 fields at all times
			nameservers.push( '' );
		}

		return nameservers.map( ( nameserver, index ) => {
			let placeholder;
			if ( index < MIN_NAMESERVER_LENGTH ) {
				placeholder = translate( 'Required' );
			} else {
				placeholder = translate( 'Optional' );
			}

			return (
				<CustomNameserversRow
					key={ index }
					index={ index }
					placeholder={ placeholder }
					nameserver={ nameserver }
					selectedDomainName={ this.props.selectedDomainName }
					onChange={ this.handleChange }
					onRemove={ this.handleRemove }
				/>
			);
		} );
	}

	handleRemove = index => {
		this.props.onChange( remove( this.props.nameservers, index ) );
	};

	handleChange = ( nameserver, index ) => {
		this.props.onChange( change( this.props.nameservers, index, nameserver ) );
	};

	render() {
		const { translate } = this.props;

		if ( ! this.props.nameservers ) {
			return null;
		}

		return (
			<Card compact className="name-servers__custom-nameservers-form">
				<span>{ translate( 'Use Custom Name Servers:' ) }</span>

				{ this.warning() }

				<form>
					{ this.rows() }
					{ this.popularHostsMessage() }

					<FormFooter>
						<FormButton
							isPrimary
							onClick={ this.handleSubmit }
							disabled={ this.props.submitDisabled }
						>
							{ translate( 'Save Custom Name Servers' ) }
						</FormButton>

						<FormButton type="button" isPrimary={ false } onClick={ this.handleReset }>
							{ translate( 'Reset to Defaults' ) }
						</FormButton>
					</FormFooter>
				</form>
			</Card>
		);
	}

	handleSubmit = event => {
		event.preventDefault();

		this.props.saveCustomNameServersClick( this.props.selectedDomainName );

		this.props.onSubmit();
	};

	handleReset = event => {
		event.preventDefault();

		this.props.resetToDefaultsClick( this.props.selectedDomainName );

		this.props.onReset();
	};
}

const customNameServersLearnMoreClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn More" link in "Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_name_servers_custom_name_servers_learn_more_click',
			{ domain_name: domainName }
		)
	);

const customNameServersLookUpClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Look up..." link in "Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_name_servers_wpcom_name_servers_look_up_click', {
			domain_name: domainName,
		} )
	);

const saveCustomNameServersClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Save Custom Name Servers" in "Use Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_name_servers_save_custom_name_servers_click', {
			domain_name: domainName,
		} )
	);

const resetToDefaultsClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Reset to Defaults" Button in "Use Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_name_servers_reset_to_defaults_click', {
			domain_name: domainName,
		} )
	);

export default connect( null, {
	customNameServersLearnMoreClick,
	customNameServersLookUpClick,
	resetToDefaultsClick,
	saveCustomNameServersClick,
} )( localize( CustomNameserversForm ) );

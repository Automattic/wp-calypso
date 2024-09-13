import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import CustomNameserversRow from './custom-nameservers-row';

import './style.scss';

const MIN_NAMESERVER_LENGTH = 2;
const MAX_NAMESERVER_LENGTH = 4;

const dropRightWhileEmpty = ( arr ) => {
	const newArr = [];
	let found = false;

	for ( let i = arr.length - 1; i >= 0; i-- ) {
		if ( found || arr[ i ] ) {
			newArr.unshift( arr[ i ] );
		}
		if ( arr[ i ] ) {
			found = true;
		}
	}

	return newArr;
};

class CustomNameserversForm extends PureComponent {
	static propTypes = {
		nameservers: PropTypes.array,
		onChange: PropTypes.func.isRequired,
		onCancel: PropTypes.func,
		onSubmit: PropTypes.func.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		submitDisabled: PropTypes.bool.isRequired,
		isSaving: PropTypes.bool,
		notice: PropTypes.element,
		redesign: PropTypes.bool,
	};

	popularHostsMessage() {
		const { translate } = this.props;

		return (
			<div className="name-servers__custom-nameservers-form-explanation">
				{ translate( 'Not sure what name servers to use?' ) }{ ' ' }
				<a
					href={ localizeUrl( CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS ) }
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
		const { translate } = this.props;

		// Remove the empty values from the end, and add one empty one
		const nameservers = dropRightWhileEmpty( this.props.nameservers );

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
				placeholder = translate( 'eg. ns%(index)d.example.com', { args: { index: index + 1 } } );
			} else {
				placeholder = translate( 'eg. ns%(index)d.example.com (optional)', {
					args: { index: index + 1 },
				} );
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

	handleRemove = ( index ) => {
		this.props.onChange( this.props.nameservers.filter( ( ns, idx ) => idx !== index ) );
	};

	handleChange = ( nameserver, index ) => {
		const nameservers = [ ...this.props.nameservers ];
		nameservers[ index ] = ( nameserver || '' ).trim();
		this.props.onChange( nameservers );
	};

	render() {
		const { redesign } = this.props;

		if ( ! this.props.nameservers ) {
			return null;
		}

		if ( redesign ) {
			return <div className="name-servers__custom-nameservers-form">{ this.renderContent() }</div>;
		}

		return (
			<Card compact className="name-servers__custom-nameservers-form">
				{ this.renderContent() }
			</Card>
		);
	}

	renderContent() {
		const { notice, redesign, translate } = this.props;

		const title = redesign
			? translate( 'Enter your custom name servers' )
			: translate( 'Use custom name servers:' );
		const subtitle = translate( '{{link}}Look up{{/link}} the name servers for popular hosts', {
			components: {
				link: (
					<a
						href={ localizeUrl( CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS ) }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.handleLookUpClick }
					/>
				),
			},
		} );

		return (
			<>
				<strong>{ title }</strong>
				{ redesign && <p className="name-servers__custom-nameservers-subtitle">{ subtitle }</p> }

				<form>
					{ this.rows() }
					{ ! redesign && this.popularHostsMessage() }
					{ redesign && notice }
					<div className="name-servers__custom-nameservers-form-buttons">
						<FormButton
							isPrimary
							onClick={ this.handleSubmit }
							disabled={ this.props.submitDisabled || this.props.isSaving }
						>
							{ translate( 'Save custom name servers' ) }
						</FormButton>

						{ ! redesign ? (
							<FormButton
								type="button"
								isPrimary={ false }
								onClick={ this.handleReset }
								busy={ this.props.isSaving }
								disabled={ this.props.isSaving }
							>
								{ translate( 'Reset to defaults' ) }
							</FormButton>
						) : (
							<FormButton
								type="button"
								isPrimary={ false }
								onClick={ this.handleCancel }
								busy={ this.props.isSaving }
								disabled={ this.props.isSaving }
							>
								{ translate( 'Cancel' ) }
							</FormButton>
						) }
					</div>
				</form>
			</>
		);
	}

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.props.saveCustomNameServersClick( this.props.selectedDomainName );

		this.props.onSubmit();
	};

	handleReset = ( event ) => {
		event.preventDefault();

		this.props.resetToDefaultsClick( this.props.selectedDomainName );

		this.props.onReset();
	};

	handleCancel = ( event ) => {
		event.preventDefault();
		this.props.onCancel();
	};
}

const customNameServersLookUpClick = ( domainName ) =>
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

const saveCustomNameServersClick = ( domainName ) =>
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

const resetToDefaultsClick = ( domainName ) =>
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
	customNameServersLookUpClick,
	resetToDefaultsClick,
	saveCustomNameServersClick,
} )( localize( CustomNameserversForm ) );

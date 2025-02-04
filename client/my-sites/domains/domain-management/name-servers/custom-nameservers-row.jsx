import { Button, Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

class CustomNameserversRow extends PureComponent {
	static propTypes = {
		index: PropTypes.number,
		nameserver: PropTypes.string,
		onChange: PropTypes.func,
		onRemove: PropTypes.func,
		isSaving: PropTypes.bool,
	};

	renderRemoveIcon() {
		if ( ! this.props.nameserver ) {
			return null;
		}

		return (
			<Button borderless compact onClick={ this.handleRemove } disabled={ this.props.isSaving }>
				<Gridicon icon="trash" />
			</Button>
		);
	}

	render() {
		return (
			<div className="name-servers__custom-nameservers-row">
				<FormFieldset>
					<FormTextInput
						placeholder={ this.props.placeholder }
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						value={ this.props.nameserver }
						disabled={ this.props.isSaving }
					/>

					{ this.renderRemoveIcon() }
				</FormFieldset>
			</div>
		);
	}

	handleChange = ( event ) => {
		if ( this.props.onChange ) {
			this.props.onChange( event.target.value, this.props.index );
		}
	};

	handleFocus = () => {
		this.props.customNameserverInputFocus( this.props.selectedDomainName );
	};

	handleRemove = ( event ) => {
		event.preventDefault();

		this.props.removeNameserversClick( this.props.selectedDomainName );

		this.props.onRemove( this.props.index );
	};
}

const customNameserverInputFocus = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Focused Input in "Use Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_name_servers_custom_name_server_input_focus', {
			domain_name: domainName,
		} )
	);

const removeNameserversClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Remove" in "Use Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_name_servers_remove_click', {
			domain_name: domainName,
		} )
	);

export default connect( null, {
	customNameserverInputFocus,
	removeNameserversClick,
} )( CustomNameserversRow );

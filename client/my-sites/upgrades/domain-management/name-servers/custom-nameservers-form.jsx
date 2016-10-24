/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import dropRightWhile from 'lodash/dropRightWhile';
import negate from 'lodash/negate';
import identity from 'lodash/identity';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import CustomNameserversRow from './custom-nameservers-row';
import { change, remove } from 'lib/domains/nameservers';
import analyticsMixin from 'lib/mixins/analytics';
import Notice from 'components/notice';
import support from 'lib/url/support';

const MIN_NAMESERVER_LENGTH = 2,
	MAX_NAMESERVER_LENGTH = 4;

const CustomNameserversForm = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'nameServers' ) ],

	propTypes: {
		nameservers: React.PropTypes.array,
		onChange: React.PropTypes.func.isRequired,
		onSubmit: React.PropTypes.func.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		submitDisabled: React.PropTypes.bool.isRequired
	},

	warning() {
		return (
			<Notice
				status="is-warning"
				showDismiss={ false }>
				{ this.translate(
					'Your domain must use WordPress.com name servers for your ' +
					'WordPress.com site to load & other features to be available.'
				) }
				{ ' ' }
				<a href={ support.CHANGE_NAME_SERVERS }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.handleLearnMoreClick }>
					{ this.translate( 'Learn more.' ) }
				</a>
			</Notice>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'customNameServersLearnMoreClick', this.props.selectedDomainName );
	},

	popularHostsMessage() {
		return (
			<div className="custom-nameservers-form__explanation">
				{ this.translate( 'Not sure what name servers to use?' ) }
				{ ' ' }
				<a href={ support.CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.handleLookUpClick }>
					{ this.translate( 'Look up the name servers for popular hosts.' ) }
				</a>
			</div>
		);
	},

	handleLookUpClick() {
		this.recordEvent( 'customNameServersLookUpClick', this.props.selectedDomainName );
	},

	rows() {
		// Remove the empty values from the end, and add one empty one
		let nameservers = dropRightWhile( this.props.nameservers, negate( identity ) );

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
				placeholder = this.translate( 'Required' );
			} else {
				placeholder = this.translate( 'Optional' );
			}

			return (
				<CustomNameserversRow
					key={ index }
					index={ index }
					placeholder={ placeholder }
					nameserver={ nameserver }
					selectedDomainName={ this.props.selectedDomainName }
					onChange={ this.handleChange }
					onRemove={ this.handleRemove } />
			);
		} );
	},

	handleRemove( index ) {
		this.props.onChange( remove( this.props.nameservers, index ) );
	},

	handleChange( nameserver, index ) {
		this.props.onChange( change( this.props.nameservers, index, nameserver ) );
	},

	render() {
		const classes = classnames( 'button is-primary is-full-width', { disabled: this.props.submitDisabled } );

		if ( ! this.props.nameservers ) {
			return null;
		}

		return (
			<div className="custom-nameservers-form is-compact card">
				<span>{ this.translate( 'Use Custom Name Servers:' ) }</span>

				{ this.warning() }

				<form>
					{ this.rows() }
					{ this.popularHostsMessage() }

					<FormFooter>
						<FormButton
							onClick={ this.handleSubmit }
							className={ classes }
							disabled={ this.props.submitDisabled }>
							{ this.translate( 'Save Custom Name Servers' ) }
						</FormButton>

						<FormButton
							type="button"
							isPrimary={ false }
							onClick={ this.handleReset }>
							{ this.translate( 'Reset to Defaults' ) }
						</FormButton>
					</FormFooter>
				</form>
			</div>
		);
	},

	handleSubmit( event ) {
		event.preventDefault();

		this.recordEvent( 'saveCustomNameServersClick', this.props.selectedDomainName );

		this.props.onSubmit();
	},

	handleReset( event ) {
		event.preventDefault();

		this.recordEvent( 'resetToDefaultsClick', this.props.selectedDomainName );

		this.props.onReset();
	}
} );

export default CustomNameserversForm;

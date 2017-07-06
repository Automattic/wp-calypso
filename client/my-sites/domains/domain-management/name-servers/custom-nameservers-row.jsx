/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Button from 'components/button';

const CustomNameserversRow = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'nameServers' ) ],

	propTypes: {
		index: React.PropTypes.number,
		nameserver: React.PropTypes.string,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func
	},

	handleRemove( event ) {
		event.preventDefault();

		this.recordEvent( 'removeClick', this.props.selectedDomainName );

		this.props.onRemove( this.props.index );
	},

	renderRemoveIcon() {
		if ( ! this.props.nameserver ) {
			return null;
		}

		return (
			<Button borderless compact onClick={ this.handleRemove }>
				<Gridicon icon="trash" />
			</Button>
		);
	},

	render() {
		return (
			<div className="custom-nameservers-row">
				<fieldset>
					<input type="text"
						placeholder={ this.props.placeholder }
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						value={ this.props.nameserver } />

					{ this.renderRemoveIcon() }
				</fieldset>
			</div>
		);
	},

	handleChange( event ) {
		if ( this.props.onChange ) {
			this.props.onChange( event.target.value, this.props.index );
		}
	},

	handleFocus() {
		this.recordEvent( 'customNameserverInputFocus', this.props.selectedDomainName );
	}
} );

module.exports = CustomNameserversRow;

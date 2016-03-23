/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLInput',

	getInitialState() {
		return {
			value: ''
		}
	},

	onChange( event ) {
		this.setState( {
			value: event.target.value
		}, this.props.onChange );
	},

	renderButtonLabel() {
		if ( ! this.props.isFetching ) {
			return( this.translate( 'Connect Now' ) );
		}
		return( this.translate( 'Connecting…' ) )
	},

	render() {
		return (
			<div>
				<FormLabel>{ this.translate( 'Site Address' ) }</FormLabel>
				<div className="site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput
						onChange={ this.onChange }
						disabled={ this.props.isFetching }
						placeholder={ this.translate( 'http://www.yoursite.com' ) } />
					{ this.props.isFetching
						? ( <Spinner duration={ 30 } /> )
						: null }
				</div>
				<Button primary
					disabled={ ( ! this.state.value || this.props.isFetching ) }
					onClick={ this.props.onClick }>{ this.renderButtonLabel() }</Button>
			</div>
		);
	}

} );

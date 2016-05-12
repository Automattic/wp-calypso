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
import untrailingslashit from 'lib/route/untrailingslashit';

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLInput',

	getInitialState() {
		return {
			value: ''
		};
	},

	onChange( event ) {
		this.setState( {
			value: untrailingslashit( event.target.value )
		}, this.props.onChange );
	},

	renderButtonLabel() {
		if ( ! this.props.isFetching ) {
			if ( ! this.props.isInstall ) {
				return( this.translate( 'Connect Now' ) );
			}
			return this.translate( 'Start Installation' );
		}
		return( this.translate( 'Connecting…' ) );
	},

	handleKeyPress( event ) {
		if ( 13 === event.keyCode ) {
			this.props.onClick();
		}
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
						placeholder={ this.translate( 'http://www.yoursite.com' ) }
						onKeyUp={ this.handleKeyPress } />
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

import React from 'react';

import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import Spinner from 'components/spinner';


export default React.createClass( {
	displayName: 'JetpackConnectSiteURLInput',

	getInitialState() {
		return {
			value: null,
			buttonEnabled: false,
			isSpinning: false
		}
	},

	handleChange( event ) {
		this.setState( {
			value: event.target.value
		} );

		if ( this.state.value != null ) {
			this.setState( {
				buttonEnabled: true
			} );
		}
	},

	spinny() {
		this.props.onDismissClick();
		this.setState( { isSpinning: true } );
		setTimeout( this.spinnyStop, 3000 );
	},

	spinnyStop() {
		this.setState( {
			isSpinning: false
		} )
		this.props.onClick();
	},

	buttonLabel() {
		if( !this.state.isSpinning ) {
			return( this.translate( 'Connect Now' ) );
		} else {
			return( this.translate( 'Connecting…' ) )
		}
	},

	render() {
		const dialogButtons = [ {
				action: 'cancel',
				label: this.translate( 'Cancel' )
			},
			{
				action: 'install',
				label: this.translate( 'Install Now' ),
				onClick: this.goToPluginInstall,
				isPrimary: true
			}
		];

		return (
			<div>
				<FormLabel>{ this.translate( 'Site Address' ) }</FormLabel>
				<div className="site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput
						value={ this.state.value }
						onChange={ this.handleChange }
						disabled={ this.state.isSpinning }
						placeholder={ this.translate( 'http://www.yoursite.com' ) } />
					{ this.state.isSpinning
						? ( <Spinner duration={ 30 } /> )
						: null }
				</div>
				<Button
					primary
					disabled={ ( !Boolean( this.state.value ) || this.state.isSpinning ) }
					onClick={ this.spinny }>{ this.buttonLabel() }</Button>
			</div>
		);
	}

} );

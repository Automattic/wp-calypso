/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import Button from 'components/button'

module.exports = React.createClass( {

	displayName: 'PolldaddyInstructions',

	render() {
		return (
			<li className={ 'plugin-plan ' + this.props.additionalClass }>
				<div className="plugin-plan__details">
					<h3>{ this.translate( 'Polldaddy' ) }</h3>
					<p>{ this.translate( 'Create surveys and polls' ) }</p>
				</div>
				<Button href='https://en.support.wordpress.com/setting-up-premium-services/'>{ this.translate( 'Start using Polldaddy' ) }</Button>
			</li>
		)
	}

} );

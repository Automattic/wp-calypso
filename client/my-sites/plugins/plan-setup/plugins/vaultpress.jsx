/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import Button from 'components/button'

module.exports = React.createClass( {

	displayName: 'VaultPressInstructions',

	render() {
		return (
			<li className={ 'plugin-plan ' + this.props.additionalClass }>
				<div className="plugin-plan__details">
					<h3>{ this.translate( 'VaultPress' ) }</h3>
					<p>{ this.translate( 'Backup your site' ) }</p>
				</div>
				<Button href='https://en.support.wordpress.com/setting-up-premium-services/'>{ this.translate( 'Start using VaultPress' ) }</Button>
			</li>
		)
	}

} );

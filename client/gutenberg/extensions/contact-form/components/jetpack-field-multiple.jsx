/** @format */

/**
 * External dependencies
 */
import { BaseControl, IconButton } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Component, Fragment } from '@wordpress/element';

import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import JetpackFieldSettings from './jetpack-field-settings';
import JetpackFieldLabel from './jetpack-field-label';
import JetpackOption from './jetpack-option';

class JetpackFieldMultiple extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
	}

	onChangeOption( key = null, option = null ) {
		const newOptions = this.props.options.slice( 0 );
		if ( 'object' === typeof key ) {
			newOptions.push( '' );
		} else if ( null === option ) {
			newOptions.splice( key, 1 );
		} else {
			newOptions.splice( key, 1, option );
		}
		this.props.setAttributes( { options: newOptions } );
	}

	render() {
		this.type = this.props.type;

		return (
			<Fragment>
				<JetpackFieldSettings
					required={ this.props.required }
					setAttributes={ this.props.setAttributes }
				/>
				<BaseControl
					id={ `jetpack-field-multiple-${ this.props.instanceId }` }
					className="jetpack-field"
					label={ <JetpackFieldLabel
						required={ this.props.required }
						label={ this.props.label }
						setAttributes={ this.props.setAttributes }
					/> }
				>
					<ol id={ `jetpack-field-multiple-${ this.props.instanceId }` }>
						{ this.props.options.map( ( option, index )=>(
							<JetpackOption
								type={ this.type }
								key={ index }
								option={ option }
								index={ index }
								onChangeOption={ this.onChangeOption }
							/>
						) ) }
					</ol>
					<IconButton
						icon="insert"
						label={ __( 'Insert option', 'jetpack' ) }
						onClick={ this.onChangeOption }
					> { __( 'Add', 'jetpack' ) }</IconButton>
				</BaseControl>
			</Fragment>
		);
	}
}

export default withInstanceId( JetpackFieldMultiple );

/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import {
	IconButton
} from '@wordpress/components';

import {
	Component,
	Fragment
} from '@wordpress/element';

import {
	__
} from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import JetpackFieldSettings from './JetpackFieldSettings';
import JetpackFieldLabel from './JetpackFieldLabel';
import JetpackOption from './JetpackOption';

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
		return (
			<Fragment>
				<JetpackFieldSettings
					required={ this.props.required }
					setAttributes={ this.props.setAttributes }
				/>
				<div className="jetpack-field">
					<JetpackFieldLabel
						required={ this.props.required }
						label={ this.props.label }
						setAttributes={ this.props.setAttributes }
					/>
					<ol>
						{ this.props.options.map( ( option, index )=>(
							<JetpackOption
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
				</div>
			</Fragment>
		);
	}
}

export default JetpackFieldMultiple;

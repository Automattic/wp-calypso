/** @format */

/**
 * External dependencies
 */
import { BaseControl, IconButton } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';
import JetpackOption from './jetpack-option';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class JetpackFieldMultiple extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
		this.addNewOption = this.addNewOption.bind( this );
		this.state = { inFocus: null };
	}

	onChangeOption( key = null, option = null ) {
		const newOptions = this.props.options.slice( 0 );
		if ( null === option ) {
			// Remove a key
			newOptions.splice( key, 1 );
			if ( key > 0 ) {
				this.setState( { inFocus: key - 1 } );
			}
		} else {
			// update a key
			newOptions.splice( key, 1, option );
			this.setState( { inFocus: key } ); // set the focus.
		}
		this.props.setAttributes( { options: newOptions } );
	}

	addNewOption( key = null ) {
		const newOptions = this.props.options.slice( 0 );
		let inFocus = 0;
		if ( 'object' === typeof key ) {
			newOptions.push( '' );
			inFocus = newOptions.length - 1;
		} else {
			newOptions.splice( key + 1, 0, '' );
			inFocus = key + 1;
		}

		this.setState( { inFocus: inFocus } );
		this.props.setAttributes( { options: newOptions } );
	}

	render() {
		this.type = this.props.type;
		let options = this.props.options;
		let inFocus = this.state.inFocus;
		if ( ! this.props.options.length ) {
			options = [ '' ];
			inFocus = 0;
		}

		return (
			<Fragment>
				<BaseControl
					id={ `jetpack-field-multiple-${ this.props.instanceId }` }
					className="jetpack-field jetpack-field-multiple"
					label={
						<JetpackFieldLabel
							required={ this.props.required }
							label={ this.props.label }
							setAttributes={ this.props.setAttributes }
							isSelected={ this.props.isSelected }
							resetFocus={ () => {
								this.setState( { inFocus: null } );
							} }
						/>
					}
				>
					<ol
						className="jetpack-field-multiple__list"
						id={ `jetpack-field-multiple-${ this.props.instanceId }` }
					>
						{ options.map( ( option, index ) => (
							<JetpackOption
								type={ this.type }
								key={ index }
								option={ option }
								index={ index }
								onChangeOption={ this.onChangeOption }
								isSelected={ this.props.isSelected }
								onAddOption={ this.addNewOption }
								isInFocus={ index === inFocus && this.props.isSelected }
							/>
						) ) }
					</ol>
				{ this.props.isSelected && (
					<IconButton
						className="jetpack-field-multiple__add-option"
						icon="insert"
						label={ __( 'Insert option' ) }
						onClick={ this.addNewOption }
					>
						{' '}
						{ __( 'Add option' ) }
					</IconButton>
				) }
				</BaseControl>
			</Fragment>
		);
	}
}

export default withInstanceId( JetpackFieldMultiple );

/**
 * External dependencies
 */
import { BaseControl, IconButton, TextControl, PanelBody } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';
import JetpackOption from './jetpack-option';
import { __ } from '../../../utils/i18n';

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
		const { type, instanceId, required, label, setAttributes, isSelected, id } = this.props;
		let { options } = this.props;
		let { inFocus } = this.state;
		if ( ! options.length ) {
			options = [ '' ];
			inFocus = 0;
		}

		return (
			<Fragment>
				<BaseControl
					id={ `jetpack-field-multiple-${ instanceId }` }
					className="jetpack-field jetpack-field-multiple"
					label={
						<JetpackFieldLabel
							required={ required }
							label={ label }
							setAttributes={ setAttributes }
							isSelected={ isSelected }
							resetFocus={ () => this.setState( { inFocus: null } ) }
						/>
					}
				>
					<ol
						className="jetpack-field-multiple__list"
						id={ `jetpack-field-multiple-${ instanceId }` }
					>
						{ options.map( ( option, index ) => (
							<JetpackOption
								type={ type }
								key={ index }
								option={ option }
								index={ index }
								onChangeOption={ this.onChangeOption }
								onAddOption={ this.addNewOption }
								isInFocus={ index === inFocus && isSelected }
								isSelected={ isSelected }
							/>
						) ) }
					</ol>
					{ isSelected && (
						<IconButton
							className="jetpack-field-multiple__add-option"
							icon="insert"
							label={ __( 'Insert option' ) }
							onClick={ this.addNewOption }
						>
							{ __( 'Add option' ) }
						</IconButton>
					) }
				</BaseControl>

				<InspectorControls>
					<PanelBody title={ __( 'Field Settings' ) }>
						<TextControl
							label={ __( 'ID' ) }
							value={ id }
							onChange={ value => setAttributes( { id: value } ) }
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default withInstanceId( JetpackFieldMultiple );

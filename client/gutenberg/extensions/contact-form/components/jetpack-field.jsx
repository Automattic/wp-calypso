/** @format */

/**
 * External dependencies
 */
import { TextControl, PanelBody } from '@wordpress/components';
import { Fragment, Component } from '@wordpress/element';
import classNames from 'classnames';
import { BlockControls, InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Module variables
 */
const PANEL_PLACEHOLDER = 'placeholder';
const PANEL_VALUE = 'value';

class JetpackField extends Component {
	state = {
		activePanel: PANEL_PLACEHOLDER,
	};

	toggleMode = mode => () => this.setState( { activePanel: mode } );

	renderToolbarButton( mode, label ) {
		const { activePanel } = this.state;

		return (
			<button
				className={ `components-tab-button ${ activePanel === mode ? 'is-active' : '' }` }
				onClick={ this.toggleMode( mode ) }
			>
				<span>{ label }</span>
			</button>
		);
	}

	render() {
		const {
			isSelected,
			type,
			required,
			label,
			setAttributes,
			defaultValue,
			placeholder,
			id,
		} = this.props;

		const { activePanel } = this.state;

		const inputValue = activePanel === PANEL_PLACEHOLDER ? placeholder : defaultValue;
		return (
			<Fragment>
				<div className={ classNames( 'jetpack-field', { 'is-selected': isSelected } ) }>
					<BlockControls>
						<div className="components-toolbar">
							{ this.renderToolbarButton( PANEL_PLACEHOLDER, __( 'Placeholder' ) ) }
							{ this.renderToolbarButton( PANEL_VALUE, __( 'Default Value' ) ) }
						</div>
					</BlockControls>
					<TextControl
						type={ type }
						label={
							<JetpackFieldLabel
								required={ required }
								label={ label }
								setAttributes={ setAttributes }
								isSelected={ isSelected }
							/>
						}
						onChange={ value => {
							if ( activePanel === PANEL_PLACEHOLDER ) {
								setAttributes( { placeholder: value } );
								return;
							}
							setAttributes( { defaultValue: value } );
						} }
						value={ inputValue }
					/>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Field Settings' ) }>
						<TextControl
							label={ __( 'Default Value' ) }
							value={ defaultValue }
							onChange={ value => setAttributes( { defaultValue: value } ) }
						/>
						<TextControl
							label={ __( 'Placeholder' ) }
							value={ placeholder }
							onChange={ value => setAttributes( { placeholder: value } ) }
						/>
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

export default JetpackField;

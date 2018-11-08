/** @format */

/**
 * External dependencies
 */
import { IconButton } from '@wordpress/components';
import { Component, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class JetpackOption extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
		this.onKeyPress = this.onKeyPress.bind( this );
		this.onDeleteOption = this.onDeleteOption.bind( this );
		this.textInput = createRef();
	}

	componentDidMount() {
		if ( this.props.isInFocus ) {
			this.textInput.current.focus();
		}
	}

	componentDidUpdate() {
		if ( this.props.isInFocus ) {
			this.textInput.current.focus();
		}
	}

	onChangeOption( event ) {
		this.props.onChangeOption( this.props.index, event.target.value );
	}

	onKeyPress( event ) {
		if ( event.key === 'Enter' ) {
			this.props.onAddOption( this.props.index );
			event.preventDefault();
			return;
		}

		if ( event.key === 'Backspace' && event.target.value === '' ) {
			this.props.onChangeOption( this.props.index );
			event.preventDefault();
			return;
		}
	}

	onDeleteOption() {
		this.props.onChangeOption( this.props.index );
	}

	render() {
		return (
			<li className="jetpack-option">
				{ this.props.type &&
					this.props.type !== 'select' && (
						<input className="jetpack-option__type" type={ this.props.type } disabled />
					) }
				<input
					type="text"
					className="jetpack-option__input"
					value={ this.props.option }
					placeholder={ __( 'Write option…' ) }
					onChange={ this.onChangeOption }
					onKeyDown={ this.onKeyPress }
					ref={ this.textInput }
				/>
				{ this.props.isSelected && (
					<IconButton
						className="jetpack-option__remove"
						icon="no"
						label={ __( 'Remove option' ) }
						onClick={ this.onDeleteOption }
					/>
				) }
			</li>
		);
	}
}

export default JetpackOption;

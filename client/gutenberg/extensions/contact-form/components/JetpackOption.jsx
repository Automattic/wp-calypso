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
	Component
} from '@wordpress/element';

import {
	__
} from '@wordpress/i18n';

class JetpackOption extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
		this.onDeleteOption = this.onDeleteOption.bind( this );
	}

	onChangeOption( event ) {
		this.props.onChangeOption( this.props.index, event.target.value );
	}

	onDeleteOption() {
		this.props.onChangeOption( this.props.index );
	}

	render() {
		return (
			<li>
				{ this.props.type && <input type={ this.props.type } disabled /> }
				<input
					type="text"
					className="option"
					value={ this.props.option }
					placeholder={ __( 'Enter your option value here…', 'jetpack' ) }
					onChange={ this.onChangeOption }
				/>
				<IconButton
					icon="no"
					label={ __( 'Remove option', 'jetpack' ) }
					onClick={ this.onDeleteOption }
				/>
			</li>
		);
	}
}

export default JetpackOption;

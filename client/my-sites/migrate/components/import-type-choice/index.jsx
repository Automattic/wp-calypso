/**
 * External dependencies
 */
import React, { Component } from 'react';
import { findKey, map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';

import './style.scss';
import PropTypes from 'prop-types';

export default class ImportTypeChoice extends Component {
	state = {
		activeItem: null,
	};

	constructor( props ) {
		super( props );

		let firstSelectedItem = findKey(
			props.radioOptions,
			( el ) => el.selected !== true && el.enabled !== false
		);
		if ( firstSelectedItem === -1 ) {
			firstSelectedItem = findKey( props.radioOptions, ( el ) => el.enabled !== false );
		}

		this.state.activeItem = firstSelectedItem !== -1 ? firstSelectedItem : null;
	}

	componentDidMount = () => {
		// Update the parent about the chosen item after we choose it.
		this.props.onChange( this.state.activeItem );
	};

	onClickHandler = ( event ) => {
		event.preventDefault();

		const chosenItem = event.currentTarget.dataset.key;

		if ( ! chosenItem ) {
			return;
		}

		if ( this.props.radioOptions[ chosenItem ].enabled === false ) {
			return;
		}

		if ( this.state.activeItem !== chosenItem ) {
			this.setState( { activeItem: chosenItem } );
			this.props.onChange( chosenItem );
		}
	};

	onKeyPressHandler = ( event ) => {
		// TODO implement this to act on enter key
		event.preventDefault();
	};

	renderOption = ( item, key ) => {
		const className = classNames( 'import-type-choice__option-wrapper', {
			disabled: this.props.radioOptions[ key ].enabled === false,
			selected: this.state.activeItem === key,
		} );

		return (
			<div
				className={ className }
				onClick={ this.onClickHandler }
				onKeyPress={ this.onKeyPressHandler }
				role="button"
				tabIndex={ 0 }
				data-key={ key }
				key={ key }
			>
				<input type="radio" checked={ this.state.activeItem === key } readOnly={ true } />
				<div className="import-type-choice__option-data">
					<div className="import-type-choice__option-header">
						<p className="import-type-choice__option-title">{ item.title }</p>

						{ item.labels &&
							item.labels.map( ( label, idx ) => (
								<Badge type="info" key={ idx }>
									{ label }
								</Badge>
							) ) }
					</div>
					<div className="import-type-choice__option-description">{ item.description }</div>
				</div>
			</div>
		);
	};

	render() {
		const items = this.props.radioOptions; // TODO pass as props

		return (
			<div className="import-type-choice__wrapper">
				{ map( items, ( item, key ) => this.renderOption( item, key ) ) }
			</div>
		);
	}
}

ImportTypeChoice.propTypes = {
	radioOptions: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
};

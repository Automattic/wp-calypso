/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import classNames from 'classnames';

export default class FormToggle extends PureComponent {
	static propTypes = {
		onChange: PropTypes.func,
		onKeyDown: PropTypes.func,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		id: PropTypes.string,
		className: PropTypes.string,
		toggling: PropTypes.bool,
		'aria-label': PropTypes.string,
		children: PropTypes.node
	};

	static defaultProps = {
		checked: false,
		disabled: false
	};

	static idNum = 0;

	constructor() {
		super( ...arguments );

		this.onKeyDown = this.onKeyDown.bind( this );
	}

	componentWillMount() {
		this.id = this.constructor.idNum++;
	}

	onKeyDown( event ) {
		if ( ! this.props.disabled ) {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				event.preventDefault();
				this.props.onChange();
			}
		}
		if ( this.props.onKeyDown ) {
			this.props.onKeyDown( event );
		}
	}

	render() {
		const id = this.props.id || 'toggle-' + this.id;
		const toggleClasses = classNames( 'form-toggle', this.props.className, {
			'is-toggling': this.props.toggling
		} );

		return (
			<span>
				<input
					className={ toggleClasses }
					type="checkbox"
					checked={ this.props.checked }
					readOnly={ true }
					disabled={ this.props.disabled }
					/>
				<label className="form-toggle__label" htmlFor={ id } >
					<span className="form-toggle__switch"
						disabled={ this.props.disabled }
						id={ id }
						onClick={ this.props.onChange }
						onKeyDown={ this.onKeyDown }
						role="checkbox"
						aria-checked={ this.props.checked }
						aria-label={ this.props[ 'aria-label' ] }
						tabIndex={ this.props.disabled ? -1 : 0 }
						></span>
					{ this.props.children }
				</label>
			</span>
		);
	}
}

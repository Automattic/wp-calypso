/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Gridicon from 'components/gridicon';

function enhanceWithArrowControls( WrappedComponent ) {
	const componentName = WrappedComponent.displayName || WrappedComponent.name;

	return class extends Component {
		static displayName = `Wrapped${ componentName }`;

		state = { isSelected: false };

		handleClickOutside() {
			this.setState( { isSelected: false } );
		}

		onBlockSelect = () => {
			this.setState( {
				isSelected: ! this.state.isSelected
			} );
		}

		moveUp = () => {
			this.props.dispatch( {
				type: 'moveUp',
				id: this.props.id,
			} );
		}

		moveDown = () => {
			this.props.dispatch( {
				type: 'moveDown',
				id: this.props.id,
			} );
		}

		render() {
			const { isSelected } = this.state;

			const classes = classNames( 'block', {
				'is-selected': isSelected
			} );

			return (
				<div className={ classes }
					style={ WrappedComponent.blockStyle }
					onClick={ this.onBlockSelect }
				>
					<WrappedComponent { ...{ ...this.props, isSelected } } />
					{ isSelected &&
						<div className="block__controls">
							<Animate type="appear">
								<Gridicon icon="chevron-up" onClick={ this.moveUp } />
								<Gridicon icon="chevron-down" onClick={ this.moveDown } />
							</Animate>
						</div>
					}
				</div>
			);
		}
	};
}

export default flow(
	enhanceWithArrowControls,
	enhanceWithClickOutside
);

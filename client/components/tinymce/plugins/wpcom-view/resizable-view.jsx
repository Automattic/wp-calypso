/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default function ( Component ) {
	const componentName = Component.displayName || Component.name || '';

	return class extends PureComponent {
		static displayName = `ResizableView(${ componentName })`;

		static propTypes = {
			onResize: PropTypes.func,
		};

		static defaultProps = {
			onResize: () => {},
		};

		constructor() {
			super( ...arguments );

			this.boundSetWrapperState = this.setWrapperState.bind( this );
			this.state = {
				wrapper: null,
			};
		}

		setWrapperState( wrapper ) {
			if ( ! wrapper ) {
				return;
			}

			this.setState( { wrapper } );
			this.disconnectObserver();
			this.observer = new MutationObserver( this.props.onResize );
			this.observer.observe( wrapper, {
				attributes: true,
				childList: true,
				subtree: true,
			} );
		}

		componentWillUnmount() {
			this.disconnectObserver();
		}

		disconnectObserver() {
			if ( this.observer ) {
				this.observer.disconnect();
			}
		}

		render() {
			let childProps;
			if ( this.state.wrapper ) {
				childProps = {
					width: this.state.wrapper.clientWidth,
				};
			}

			return (
				<div ref={ this.boundSetWrapperState }>
					<Component { ...this.props } { ...childProps } />
				</div>
			);
		}
	};
}

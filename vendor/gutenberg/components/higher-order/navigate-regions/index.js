/**
 * External Dependencies
 */
import classnames from 'classnames';

/**
 * WordPress Dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';

/**
 * Internal Dependencies
 */
import './style.scss';
import KeyboardShortcuts from '../../keyboard-shortcuts';

export default createHigherOrderComponent(
	( WrappedComponent ) => {
		return class extends Component {
			constructor() {
				super( ...arguments );
				this.bindContainer = this.bindContainer.bind( this );
				this.focusNextRegion = this.focusRegion.bind( this, 1 );
				this.focusPreviousRegion = this.focusRegion.bind( this, -1 );
				this.onClick = this.onClick.bind( this );
				this.state = {
					isFocusingRegions: false,
				};
			}

			bindContainer( ref ) {
				this.container = ref;
			}

			focusRegion( offset ) {
				const regions = [ ...this.container.querySelectorAll( '[role="region"]' ) ];
				if ( ! regions.length ) {
					return;
				}
				let nextRegion = regions[ 0 ];
				const selectedIndex = regions.indexOf( document.activeElement );
				if ( selectedIndex !== -1 ) {
					let nextIndex = selectedIndex + offset;
					nextIndex = nextIndex === -1 ? regions.length - 1 : nextIndex;
					nextIndex = nextIndex === regions.length ? 0 : nextIndex;
					nextRegion = regions[ nextIndex ];
				}

				nextRegion.focus();
				this.setState( { isFocusingRegions: true } );
			}

			onClick() {
				this.setState( { isFocusingRegions: false } );
			}

			render() {
				const className = classnames( 'components-navigate-regions', {
					'is-focusing-regions': this.state.isFocusingRegions,
				} );

				// Disable reason: Clicking the editor should dismiss the regions focus style
				/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
				return (
					<div ref={ this.bindContainer } className={ className } onClick={ this.onClick }>
						<KeyboardShortcuts
							bindGlobal
							shortcuts={ {
								'ctrl+`': this.focusNextRegion,
								'ctrl+shift+`': this.focusPreviousRegion,
							} }
						/>
						<WrappedComponent { ...this.props } />
					</div>
				);
				/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
			}
		};
	}, 'navigateRegions'
);

/**
 * WordPress dependencies
 */
import {
	Component,
	createRef,
	createHigherOrderComponent,
} from '@wordpress/element';
import { keycodes } from '@wordpress/utils';
import { focus } from '@wordpress/dom';

const { TAB } = keycodes;

const withConstrainedTabbing = createHigherOrderComponent(
	( WrappedComponent ) => class extends Component {
		constructor() {
			super( ...arguments );

			this.focusContainRef = createRef();
			this.handleTabBehaviour = this.handleTabBehaviour.bind( this );
		}

		handleTabBehaviour( event ) {
			if ( event.keyCode !== TAB ) {
				return;
			}

			const tabbables = focus.tabbable.find( this.focusContainRef.current );
			if ( ! tabbables.length ) {
				return;
			}
			const firstTabbable = tabbables[ 0 ];
			const lastTabbable = tabbables[ tabbables.length - 1 ];

			if ( event.shiftKey && event.target === firstTabbable ) {
				event.preventDefault();
				lastTabbable.focus();
			} else if ( ! event.shiftKey && event.target === lastTabbable ) {
				event.preventDefault();
				firstTabbable.focus();
			}
		}

		render() {
			// Disable reason: this component is non-interactive, but must capture
			// events from the wrapped component to determine when the Tab key is used.
			/* eslint-disable jsx-a11y/no-static-element-interactions */
			return (
				<div
					onKeyDown={ this.handleTabBehaviour }
					ref={ this.focusContainRef }
				>
					<WrappedComponent { ...this.props } />
				</div>
			);
			/* eslint-enable jsx-a11y/no-static-element-interactions */
		}
	},
	'withConstrainedTabbing'
);

export default withConstrainedTabbing;

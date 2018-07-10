/**
 * External dependencies
 */
import { debounce, uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';
import { addAction, applyFilters, removeAction } from '@wordpress/hooks';

const ANIMATION_FRAME_PERIOD = 16;

/**
 * Creates a higher-order component which adds filtering capability to the
 * wrapped component. Filters get applied when the original component is about
 * to be mounted. When a filter is added or removed that matches the hook name,
 * the wrapped component re-renders.
 *
 * @param {string} hookName Hook name exposed to be used by filters.
 *
 * @return {Function} Higher-order component factory.
 */
export default function withFilters( hookName ) {
	return createHigherOrderComponent( ( OriginalComponent ) => {
		return class FilteredComponent extends Component {
			/** @inheritdoc */
			constructor( props ) {
				super( props );

				this.onHooksUpdated = this.onHooksUpdated.bind( this );
				this.Component = applyFilters( hookName, OriginalComponent );
				this.namespace = uniqueId( 'core/with-filters/component-' );
				this.throttledForceUpdate = debounce( () => {
					this.Component = applyFilters( hookName, OriginalComponent );
					this.forceUpdate();
				}, ANIMATION_FRAME_PERIOD );

				addAction( 'hookRemoved', this.namespace, this.onHooksUpdated );
				addAction( 'hookAdded', this.namespace, this.onHooksUpdated );
			}

			/** @inheritdoc */
			componentWillUnmount() {
				this.throttledForceUpdate.cancel();
				removeAction( 'hookRemoved', this.namespace );
				removeAction( 'hookAdded', this.namespace );
			}

			/**
			 * When a filter is added or removed for the matching hook name, the wrapped component should re-render.
			 *
			 * @param {string} updatedHookName  Name of the hook that was updated.
			 */
			onHooksUpdated( updatedHookName ) {
				if ( updatedHookName === hookName ) {
					this.throttledForceUpdate();
				}
			}

			/** @inheritdoc */
			render() {
				return <this.Component { ...this.props } />;
			}
		};
	}, 'withFilters' );
}

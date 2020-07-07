/**
 * External dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JanitorialList from './janitorial-list';

window.addEventListener( 'load', function () {
	const janitorialContainers = document.getElementsByClassName(
		'wp-block-janitorial-state-widget-main-container'
	);

	for ( const janitorialContainer of janitorialContainers ) {
		const pageId = parseInt( janitorial_state_widget.page );
		const selectedArray = janitorial_state_widget.selected || [];
		const id = parseInt( janitorialContainer.dataset.id || 0 );
		const selected = selectedArray[ id ] || '';
		const tiers = JSON.parse( janitorialContainer.dataset.tiers || '[]' );

		render(
			<JanitorialList
				blockId={ id }
				tiers={ tiers }
				selected={ selected }
				pageId={ pageId }
				canEdit={ janitorial_state_widget.can_edit }
				isFrontend={ true }
			/>,
			janitorialContainer
		);
	}
} );

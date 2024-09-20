/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';
/**
 * Internal dependencies
 */
import SupportPrompt from './support-prompt';

window.renderSupportPrompt = ( elementId ) => {
	render( <SupportPrompt />, document.getElementById( elementId ) );
};

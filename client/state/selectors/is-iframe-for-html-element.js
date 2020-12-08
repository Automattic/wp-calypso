/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSectionName from 'calypso/state/ui/selectors/get-section-name';

const isIframeForHtmlElement = ( state ) =>
	!! ( getSelectedSiteId( state ) && getSectionName( state ) === 'gutenberg-editor' );
export default isIframeForHtmlElement;

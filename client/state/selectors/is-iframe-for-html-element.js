import getSectionName from 'calypso/state/ui/selectors/get-section-name';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const isIframeForHtmlElement = ( state ) =>
	!! ( getSelectedSiteId( state ) && getSectionName( state ) === 'gutenberg-editor' );
export default isIframeForHtmlElement;

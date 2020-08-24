/**
 * Internal dependencies
 */
import getPreviousRoute from 'state/selectors/get-previous-route';

export const isPreviousRouteGutenberg = ( state ) =>
	0 === getPreviousRoute( state ).indexOf( '/block-editor' );

export default isPreviousRouteGutenberg;

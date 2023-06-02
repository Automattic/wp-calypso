import { Tip } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { get, filter, deburr, lowerCase, includes } from 'lodash';
import tipsList from './list';

function ContextualTip( { searchTerm, random = false, canUserCreate } ) {
	if ( ! searchTerm ) {
		return null;
	}

	if ( ! tipsList.length ) {
		return null;
	}

	const normalizedSearchTerm = deburr( lowerCase( searchTerm ) ).replace( /^\//, '' );

	const foundTips = filter(
		tipsList,
		( { keywords, permission } ) =>
			canUserCreate( permission ) &&
			filter( [ ...new Set( keywords ) ], ( keyword ) => includes( normalizedSearchTerm, keyword ) )
				.length
	);

	if ( ! foundTips.length ) {
		return null;
	}

	const index = random ? Math.floor( Math.random() * foundTips.length ) : 0;

	return (
		<div className="contextual-tip">
			<Tip>{ get( foundTips, [ index, 'description' ] ) }</Tip>
		</div>
	);
}

export default compose(
	withSelect( ( select ) => {
		return {
			canUserCreate: ( type ) => select( 'core' ).canUser( 'create', type ),
		};
	} )
)( ContextualTip );

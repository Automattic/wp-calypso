/**
 * External dependencies
 */
import classNames from 'classnames';
import { assign, some, startsWith } from 'lodash';

const exported = {
	itemLinkClass: function ( path, currentPath, additionalClasses ) {
		const basePathLowerCase = decodeURIComponent( currentPath )
				.split( '?' )[ 0 ]
				.replace( /\/manage$/, '' )
				.toLowerCase(),
			pathLowerCase = decodeURIComponent( path )
				.replace( /\/manage$/, '' )
				.toLowerCase();

		let selected = basePathLowerCase === pathLowerCase,
			isActionButtonSelected = false;

		// Following is a special case, because it can be at / or /following
		if ( pathLowerCase === '/' && ! selected ) {
			selected = '/following' === basePathLowerCase;
		}

		// Are we on the manage page?
		const pathWithoutQueryString = currentPath.split( '?' )[ 0 ];
		if ( selected && !! pathWithoutQueryString.match( /\/manage$/ ) ) {
			isActionButtonSelected = true;
		}

		return classNames(
			assign(
				{ selected: selected, 'is-action-button-selected': isActionButtonSelected },
				additionalClasses
			)
		);
	},

	itemLinkClassStartsWithOneOf: function ( paths, currentPath, additionalClasses ) {
		const selected = this.pathStartsWithOneOf( paths, currentPath );
		return classNames( assign( { selected }, additionalClasses ) );
	},

	pathStartsWithOneOf: function ( paths, currentPath ) {
		return some( paths, function ( path ) {
			return startsWith( currentPath.toLowerCase(), path.toLowerCase() );
		} );
	},
};

export default exported;

export const { itemLinkClass, itemLinkClassStartsWithOneOf, pathStartsWithOneOf } = exported;

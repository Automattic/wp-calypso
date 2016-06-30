/**
 * External dependencies
 */
import classNames from 'classnames';
import some from 'lodash/some';
import startsWith from 'lodash/startsWith';
import assign from 'lodash/assign';

module.exports = {
	itemLinkClass: function( path, currentPath, additionalClasses ) {
		const basePathLowerCase = decodeURIComponent( currentPath ).split( '?' )[ 0 ].replace( /\/edit$/, '' ).toLowerCase(),
			pathLowerCase = decodeURIComponent( path ).replace( /\/edit$/, '' ).toLowerCase();

		let selected = basePathLowerCase === pathLowerCase,
			isActionButtonSelected = false;

		// Following is a special case, because it can be at / or /following
		if ( pathLowerCase === '/' && ! selected ) {
			selected = '/following' === basePathLowerCase;
		}

		// Are we on an edit page?
		const pathWithoutQueryString = currentPath.split( '?' )[ 0 ];
		if ( selected && !! pathWithoutQueryString.match( /\/edit$/ ) ) {
			isActionButtonSelected = true;
		}

		return classNames( assign( { selected: selected, 'is-action-button-selected': isActionButtonSelected }, additionalClasses ) );
	},

	itemLinkClassStartsWithOneOf: function( paths, currentPath, additionalClasses ) {
		const selected = this.pathStartsWithOneOf( paths, currentPath );
		return classNames( assign( { selected }, additionalClasses ) );
	},

	pathStartsWithOneOf: function( paths, currentPath ) {
		return some( paths, function( path ) {
			return startsWith( currentPath.toLowerCase(), path.toLowerCase() );
		} );
	}
};

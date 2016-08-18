/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	difference,
	findKey,
	get,
	identity,
	isString,
	isUndefined,
	map,
	matches,
	noop,
	pick,
	property,
	values as valuesOf
} from 'lodash';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import TokenField from 'components/token-field';
import { localize } from 'i18n-calypso';

import { removeBlanks } from './mappings';

const titleTypes = translate => [
	{ value: 'frontPage', label: translate( 'Front Page' ) },
	{ value: 'posts', label: translate( 'Posts' ) },
	{ value: 'pages', label: translate( 'Pages' ) },
	{ value: 'groups', label: translate( 'Tags' ) },
	{ value: 'archives', label: translate( 'Archives' ) }
];

const getValidTokens = translate => ( {
	siteName: translate( 'Site Name' ),
	tagline: translate( 'Tagline' ),
	postTitle: translate( 'Post Title' ),
	pageTitle: translate( 'Page Title' ),
	groupTitle: translate( 'Category/Tag Title' ),
	date: translate( 'Date' )
} );

const tokenMap = {
	frontPage: [ 'siteName', 'tagline' ],
	posts: [ 'siteName', 'tagline', 'postTitle' ],
	pages: [ 'siteName', 'tagline', 'pageTitle' ],
	groups: [ 'siteName', 'tagline', 'groupTitle' ],
	archives: [ 'siteName', 'tagline', 'date' ]
};

const tokenize = translate => value => {
	if ( ! isString( value ) ) {
		return value;
	}

	// find token key from translated label
	// e.g. "Post Title" > postTitle: translate( 'Post Title' )
	//         value          type           translation
	const type = findKey( getValidTokens( translate ), matches( value ) );

	return isUndefined( type )
		? { type: 'string', isBorderless: true, value }
		: { type, value };
};

export class MetaTitleEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			type: 'frontPage'
		};

		this.switchType = this.switchType.bind( this );
		this.updateTitleFormat = this.updateTitleFormat.bind( this );
	}

	switchType( { value: type } ) {
		this.setState( { type } );
	}

	updateTitleFormat( values ) {
		const { onChange, translate, titleFormats } = this.props;
		const { type } = this.state;

		const tokens = removeBlanks( map( values, tokenize( translate ) ) );

		onChange( {
			...titleFormats,
			[ type ]: tokens
		} );
	}

	render() {
		const { disabled, translate, titleFormats } = this.props;
		const { type } = this.state;

		const validTokens = getValidTokens( translate );

		const values = map(
			get( titleFormats, type, [] ),
			token => 'string' !== token.type
				? { ...token, value: validTokens[ token.type ] } // use translations of token names
				: { ...token, isBorderless: true }               // and remove the styling on plain text
		);

		const suggestions = difference(
			valuesOf( pick( validTokens, tokenMap[ type ] ) ), // grab list of translated tokens for this type
			map( values, property( 'value' ) )                 // but remove tokens already in use in the format
		);

		return (
			<div className="meta-title-editor">
				<SegmentedControl
					initialSelected={ type }
					options={ titleTypes( translate ) }
					onSelect={ this.switchType }
				/>
				<TokenField
					disabled={ disabled }
					onChange={ this.updateTitleFormat }
					saveTransform={ identity } // don't trim whitespace
					suggestions={ suggestions }
					value={ values }
				/>
			</div>
		);
	}
}

MetaTitleEditor.propTypes = {
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	titleFormats: PropTypes.object.isRequired
};

MetaTitleEditor.defaultProps = {
	disabled: false,
	onChange: noop,
	translate: identity
};

export default localize( MetaTitleEditor );

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import difference from 'lodash/difference';
import findKey from 'lodash/findKey';
import get from 'lodash/get';
import identity from 'lodash/identity';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import matches from 'lodash/matches';
import pick from 'lodash/pick';
import property from 'lodash/property';
import valuesOf from 'lodash/values';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import TokenField from 'components/token-field';
import { getSeoTitleFormats } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';

import { removeBlanks } from './mappings';

const titleTypes = translate => [
	{ value: 'frontPage', label: translate( 'Front Page' ) },
	{ value: 'posts', label: translate( 'Posts' ) },
	{ value: 'pages', label: translate( 'Pages' ) },
	{ value: 'groups', label: translate( 'Categories & Tags' ) },
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
	constructor( { titleFormats } ) {
		super();

		this.state = {
			titleFormats,
			type: 'frontPage'
		};

		this.switchType = this.switchType.bind( this );
		this.updateTitleFormat = this.updateTitleFormat.bind( this );
	}

	componentWillUpdate( nextProps ) {
		const { siteId: prevSiteId } = this.props;
		const { siteId: nextSiteId, titleFormats } = nextProps;

		if ( nextSiteId !== prevSiteId ) {
			// Clear all local changes when switching
			// sites to get the new site's data
			this.setState( { titleFormats } );
		}
	}

	switchType( { value: type } ) {
		this.setState( { type } );
	}

	updateTitleFormat( values ) {
		const { translate } = this.props;
		const { type } = this.state;

		const tokens = removeBlanks( map( values, tokenize( translate ) ) );

		this.setState( { titleFormats: {
			...this.state.titleFormats,
			[ type ]: tokens
		} } );
	}

	render() {
		const {
			disabled = false,
			translate = identity
		} = this.props;
		const {
			type,
			titleFormats
		} = this.state;

		const validTokens = getValidTokens( translate );

		const values = get( titleFormats, type, [] ).map(
			token => 'string' !== token.type
				? { ...token, value: validTokens[ token.type ] } // use translations of token names
				: { ...token, isBorderless: true }               // and remove the styling on plain text
		);

		const suggestions = difference(
			valuesOf( pick( validTokens, tokenMap[ type ] ) ), // grab list of translated tokens for this type
			map( values, property( 'value' ) )                 // but remove tokens already in use in the format
		);

		return (
			<div>
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
	disabled: PropTypes.bool
};

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
	titleFormats: getSeoTitleFormats( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( MetaTitleEditor ) );

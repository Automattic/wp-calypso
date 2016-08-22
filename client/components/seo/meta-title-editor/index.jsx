/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	get,
	identity,
	noop,
} from 'lodash';

/**
 * Internal dependencies
 */
import TitleFormatEditor from 'components/title-format-editor';
import { localize } from 'i18n-calypso';

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

const getTokensForType = ( type, translate ) => {
	return get( tokenMap, type, [] )
				.reduce( ( allTokens, name ) => ( {
					...allTokens,
					[ name ]: get( getValidTokens( translate ), name, '' )
				} ), {} );
};

export class MetaTitleEditor extends Component {
	constructor( props ) {
		super( props );
		this.updateTitleFormat = this.updateTitleFormat.bind( this );
	}

	updateTitleFormat( type, values ) {
		const { onChange, titleFormats } = this.props;

		onChange( {
			...titleFormats,
			[ type ]: values
		} );
	}

	render() {
		const { disabled, titleFormats, translate } = this.props;

		return (
			<div className="meta-title-editor">
				{ titleTypes( translate ).map( type =>
					<TitleFormatEditor
						key={ type.value }
						disabled={ disabled }
						onChange={ this.updateTitleFormat }
						type={ disabled ? '' : type }
						titleFormats={ get( titleFormats, type.value, [] ) }
						tokens={ getTokensForType( type.value, translate ) }
					/>
				) }
			</div>
		);
	}
}

MetaTitleEditor.propTypes = {
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	titleFormats: PropTypes.object.isRequired,
};

MetaTitleEditor.defaultProps = {
	disabled: false,
	onChange: noop,
	translate: identity
};

export default localize( MetaTitleEditor );

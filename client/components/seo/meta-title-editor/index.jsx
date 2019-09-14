/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import TitleFormatEditor from 'components/title-format-editor';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

const titleTypes = translate => [
	{ value: 'frontPage', label: translate( 'Front Page' ) },
	{ value: 'posts', label: translate( 'Posts' ) },
	{ value: 'pages', label: translate( 'Pages' ) },
	{ value: 'groups', label: translate( 'Tags' ) },
	{ value: 'archives', label: translate( 'Archives' ) },
];

const getValidTokens = translate => ( {
	siteName: translate( 'Site Title' ),
	tagline: translate( 'Tagline' ),
	postTitle: translate( 'Post Title' ),
	pageTitle: translate( 'Page Title' ),
	groupTitle: translate( 'Tag or Category Name' ),
	date: translate( 'Date' ),
} );

const tokenMap = {
	frontPage: [ 'siteName', 'tagline' ],
	posts: [ 'siteName', 'tagline', 'postTitle' ],
	pages: [ 'siteName', 'tagline', 'pageTitle' ],
	groups: [ 'siteName', 'tagline', 'groupTitle' ],
	archives: [ 'siteName', 'tagline', 'date' ],
};

const defaultsMap = {
	frontPage: [ { type: 'siteName' }, { type: 'string', value: ' - ' }, { type: 'tagline' } ],
	posts: [ { type: 'siteName' }, { type: 'string', value: ' - ' }, { type: 'postTitle' } ],
	pages: [ { type: 'siteName' }, { type: 'string', value: ' - ' }, { type: 'pageTitle' } ],
	groups: [ { type: 'siteName' }, { type: 'string', value: ' - ' }, { type: 'groupTitle' } ],
	archives: [ { type: 'siteName' }, { type: 'string', value: ' - ' }, { type: 'date' } ],
};

const getTokensForType = ( type, translate ) => {
	return get( tokenMap, type, [] ).reduce(
		( allTokens, name ) => ( {
			...allTokens,
			[ name ]: get( getValidTokens( translate ), name, '' ),
		} ),
		{}
	);
};

export class MetaTitleEditor extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
		titleFormats: PropTypes.object.isRequired,
	};

	static defaultProps = {
		disabled: false,
		onChange: noop,
		translate: identity,
	};

	constructor( props ) {
		super( props );
		this.updateTitleFormat = this.updateTitleFormat.bind( this );
	}

	updateTitleFormat( type, values ) {
		const { onChange, titleFormats } = this.props;

		onChange( {
			...titleFormats,
			[ type ]: values,
		} );
	}

	render() {
		const { disabled, site, titleFormats, translate } = this.props;

		return (
			<div className="meta-title-editor">
				{ titleTypes( translate ).map( type => (
					<TitleFormatEditor
						key={ type.value }
						defaultValue={ get( defaultsMap, type.value, undefined ) }
						disabled={ disabled }
						onChange={ this.updateTitleFormat }
						placeholder={ site && site.title }
						type={ type }
						titleFormats={ get( titleFormats, type.value, [] ) }
						tokens={ getTokensForType( type.value, translate ) }
					/>
				) ) }
			</div>
		);
	}
}

export default localize( MetaTitleEditor );

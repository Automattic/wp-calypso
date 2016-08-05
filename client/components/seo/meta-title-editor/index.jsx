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
import SegmentedControl from 'components/segmented-control';
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
		const { onChange, titleFormats } = this.props;
		const { type } = this.state;

		onChange( {
			...titleFormats,
			[ type ]: values
		} );
	}

	render() {
		const { disabled, titleFormats, translate } = this.props;
		const { type } = this.state;

		const tokens =
			get( tokenMap, type, [] )
				.map( name => ( {
					title: get( getValidTokens( translate ), name, '' ),
					tokenName: name,
				} ) );

		return (
			<div className="meta-title-editor">
				<SegmentedControl
					initialSelected={ type }
					options={ titleTypes( translate ) }
					onSelect={ this.switchType }
				/>
				<TitleFormatEditor
					disabled={ disabled }
					onChange={ this.updateTitleFormat }
					type={ disabled ? '' : type }
					titleFormats={ get( titleFormats, type, [] ) }
					tokens={ tokens }
				/>
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

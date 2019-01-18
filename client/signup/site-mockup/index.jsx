/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { each, isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SiteMockup from './site-mockup';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalName,
	getSiteVerticalPreview,
} from 'state/signup/steps/site-vertical/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { loadFont, getCSS } from 'lib/signup/font-loader';

/**
 * Style dependencies
 */
import './style.scss';

class SiteMockups extends Component {
	static propTypes = {
		address: PropTypes.string,
		phone: PropTypes.string,
		siteStyle: PropTypes.string,
		siteType: PropTypes.string,
		title: PropTypes.string,
		vertical: PropTypes.string,
		verticalPreviewContent: PropTypes.string,
	};

	static defaultProps = {
		address: '',
		phone: '',
		siteStyle: '',
		siteType: '',
		title: '',
		vertical: '',
		verticalPreviewContent: '',
	};

	constructor( props ) {
		super( props );
		this.state = this.getNewFontLoaderState( props );
	}

	getNewFontLoaderState( props ) {
		const state = {
			fontLoaded: false,
			fontError: false,
		};

		this.fontLoader = loadFont( props.siteStyle, props.siteType );
		this.fontLoader.then( () => this.setState( { fontLoaded: true } ) );
		this.fontLoader.catch( () => this.setState( { fontError: true } ) );
		return state;
	}

	resetFontLoaderState( props ) {
		this.setState( this.getNewFontLoaderState( props ) );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteStyle !== this.props.siteStyle ) {
			this.resetFontLoaderState( this.props );
		}
	}

	/**
	 * Returns an interpolated site preview content block with template markers
	 *
	 * @param {string} content Content to format
	 * @return {string} Formatted content
	 */
	getContent( content = '' ) {
		const { title: CompanyName, address, phone } = this.props;
		if ( 'string' === typeof content ) {
			each(
				{
					CompanyName,
					Address: this.formatAddress( address ) || translate( 'Your Address' ),
					Phone: phone || translate( 'Your Phone Number' ),
				},
				( value, key ) =>
					( content = content.replace( new RegExp( '{{' + key + '}}', 'gi' ), value ) )
			);
		}
		return content;
	}

	getTagline() {
		const { address, phone } = this.props;

		if ( isEmpty( address ) && isEmpty( phone ) ) {
			return translate( 'You’ll be able to customize this to your needs.' );
		}
		return (
			<>
				{ ! isEmpty( address ) && (
					<span className="site-mockup__address">{ this.formatAddress( address ) }</span>
				) }
				{ ! isEmpty( phone ) && <span className="site-mockup__phone">{ phone }</span> }
			</>
		);
	}

	/**
	 *
	 * @param {string} address An address formatted onto separate lines
	 * @return {string} Get rid of the last line of the address.
	 */
	formatAddress( address ) {
		const parts = address.split( '\n' );
		return parts.slice( 0, 2 ).join( ', ' );
	}

	render() {
		const { siteStyle, siteType, title, verticalPreviewContent } = this.props;
		const siteMockupClasses = classNames( {
			'site-mockup__wrap': true,
			'is-empty': isEmpty( verticalPreviewContent ),
			'is-font-loading': ! this.state.fontLoaded,
			'is-font-error': ! this.state.fontError,
		} );
		const otherProps = {
			title,
			tagline: this.getTagline(),
			content: this.getContent( verticalPreviewContent ),
			siteType,
			siteStyle,
		};
		const fontStyle = getCSS( `.site-mockup__content`, siteStyle, siteType );

		return (
			<div className={ siteMockupClasses }>
				{ ! this.state.fontError && <style>{ fontStyle }</style> }
				<SiteMockup size="desktop" { ...otherProps } />
				<SiteMockup size="mobile" { ...otherProps } />
			</div>
		);
	}
}

export default connect( state => {
	const vertical = getSiteVerticalName( state );
	const siteInformation = getSiteInformation( state );
	return {
		title: siteInformation.title || translate( 'Your New Website' ),
		address: siteInformation.address,
		phone: siteInformation.phone,
		siteStyle: getSiteStyle( state ),
		siteType: getSiteType( state ),
		vertical,
		verticalPreviewContent: getSiteVerticalPreview( state ),
	};
} )( SiteMockups );

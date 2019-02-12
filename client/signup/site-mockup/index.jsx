/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, each, find, isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SignupSitePreview from 'components/signup-site-preview';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalPreview,
	getSiteVerticalSlug,
} from 'state/signup/steps/site-vertical/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getSiteStyleOptions, getThemeCssUri } from 'lib/signup/site-styles';
import { recordTracksEvent } from 'state/analytics/actions';
import { getLocaleSlug, getLanguage } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

function SiteMockupHelpTip() {
	return (
		<div className="site-mockup__help-tip">
			<p>
				{ translate(
					'Scroll down to see your website. Once you complete setup you’ll be able to customize it further.'
				) }
			</p>
			<Gridicon icon="chevron-down" />
		</div>
	);
}

class SiteMockups extends Component {
	static propTypes = {
		address: PropTypes.string,
		phone: PropTypes.string,
		siteStyle: PropTypes.string,
		siteType: PropTypes.string,
		stepName: PropTypes.string,
		title: PropTypes.string,
		vertical: PropTypes.string,
		verticalPreviewContent: PropTypes.string,
	};

	static defaultProps = {
		address: '',
		phone: '',
		siteStyle: '',
		siteType: '',
		stepName: '',
		title: '',
		vertical: '',
		verticalPreviewContent: '',
	};

	shouldComponentUpdate( nextProps ) {
		// Debouncing updates to the preview content
		// prevents the flashing effect.
		if ( nextProps.verticalPreviewContent !== this.props.verticalPreviewContent ) {
			this.updateDebounced();
			return false;
		}

		return true;
	}

	updateDebounced = debounce( this.forceUpdate, 777, { leading: false } );

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
		const hasAddress = ! isEmpty( address );
		const hasPhone = ! isEmpty( phone );

		if ( ! hasAddress && ! hasPhone ) {
			return translate( 'You’ll be able to customize this to your needs.' );
		}

		return [
			hasAddress ? this.formatAddress( address ) : '',
			hasAddress && hasPhone ? ' &middot; ' : '',
			hasPhone ? phone : '',
		].join( '' );
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

	handleClick = size =>
		this.props.handleClick( this.props.verticalSlug, this.props.siteStyle, size );

	render() {
		const { fontUrl, shouldShowHelpTip, title, themeSlug, verticalPreviewContent } = this.props;

		const siteMockupClasses = classNames( 'site-mockup__wrap', {
			'is-empty': isEmpty( verticalPreviewContent ),
		} );
		const langSlug = getLocaleSlug();
		const language = getLanguage( langSlug );
		const isRtl = language && language.rtl;
		const otherProps = {
			fontUrl,
			cssUrl: getThemeCssUri( themeSlug, isRtl ),
			content: {
				title,
				tagline: this.getTagline(),
				body: this.getContent( verticalPreviewContent ),
			},
			langSlug,
			isRtl,
		};

		return (
			<div className={ siteMockupClasses }>
				{ shouldShowHelpTip && <SiteMockupHelpTip /> }
				<div className="site-mockup__devices">
					<SignupSitePreview
						defaultViewportDevice="desktop"
						{ ...otherProps }
						onPreviewClick={ this.handleClick }
					/>
					<SignupSitePreview
						defaultViewportDevice="phone"
						{ ...otherProps }
						onPreviewClick={ this.handleClick }
					/>
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteInformation = getSiteInformation( state );
		const siteStyle = getSiteStyle( state );
		const siteType = getSiteType( state );
		const styleOptions = getSiteStyleOptions( siteType );
		const style = find( styleOptions, { id: siteStyle || 'professional' } );
		return {
			title: siteInformation.title || translate( 'Your New Website' ),
			address: siteInformation.address,
			phone: siteInformation.phone,
			siteStyle,
			siteType,
			verticalPreviewContent: getSiteVerticalPreview( state ),
			verticalSlug: getSiteVerticalSlug( state ),
			shouldShowHelpTip:
				'site-topic-with-preview' === ownProps.stepName ||
				'site-information-title-with-preview' === ownProps.stepName,
			themeSlug: style.theme,
			fontUrl: style.fontUrl,
		};
	},
	dispatch => ( {
		handleClick: ( verticalSlug, siteStyle, size ) =>
			dispatch(
				recordTracksEvent( 'calypso_signup_site_preview_mockup_clicked', {
					size,
					vertical_slug: verticalSlug,
					site_style: siteStyle || 'default',
				} )
			),
	} )
)( SiteMockups );

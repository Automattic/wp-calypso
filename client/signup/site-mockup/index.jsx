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
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getSiteStyleOptions, getThemeCssUri } from 'lib/signup/site-styles';
import { recordTracksEvent } from 'state/analytics/actions';
import { getLocaleSlug, getLanguage } from 'lib/i18n-utils';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';

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
		siteStyle: PropTypes.string,
		siteType: PropTypes.string,
		stepName: PropTypes.string,
		title: PropTypes.string,
		vertical: PropTypes.string,
		verticalPreviewContent: PropTypes.string,
	};

	static defaultProps = {
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

	updateDebounced = debounce( this.forceUpdate, 777 );

	/**
	 * Returns an interpolated site preview content block with template markers
	 *
	 * @param {string} content Content to format
	 * @return {string} Formatted content
	 */
	getContent( content = '' ) {
		const { title: CompanyName } = this.props;
		if ( 'string' === typeof content ) {
			each(
				{
					CompanyName,
					Address: translate( 'Your Address' ),
					Phone: translate( 'Your Phone Number' ),
				},
				( value, key ) =>
					( content = content.replace( new RegExp( '{{' + key + '}}', 'gi' ), value ) )
			);
		}
		return content;
	}

	handleClick = size =>
		this.props.handleClick( this.props.verticalSlug, this.props.siteStyle, size );

	render() {
		const {
			fontUrl,
			shouldShowHelpTip,
			siteStyle,
			title,
			themeSlug,
			verticalPreviewContent,
		} = this.props;

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
				tagline: translate( 'You’ll be able to customize this to your needs.' ),
				body: this.getContent( verticalPreviewContent ),
			},
			langSlug,
			isRtl,
			onPreviewClick: this.handleClick,
			className: siteStyle,
		};

		return (
			<div className={ siteMockupClasses }>
				{ shouldShowHelpTip && <SiteMockupHelpTip /> }
				<div className="site-mockup__devices">
					<SignupSitePreview
						defaultViewportDevice="desktop"
						resize={ true }
						scrolling={ false }
						{ ...otherProps }
					/>
					<SignupSitePreview defaultViewportDevice="phone" { ...otherProps } />
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteStyle = getSiteStyle( state );
		const siteType = getSiteType( state );
		const styleOptions = getSiteStyleOptions( siteType );
		const style = find( styleOptions, { id: siteStyle || 'modern' } );
		return {
			title: getSiteTitle( state ) || translate( 'Your New Website' ),
			siteStyle,
			siteType,
			verticalPreviewContent: getSiteVerticalPreview( state ),
			verticalSlug: getSiteVerticalSlug( state ),
			shouldShowHelpTip:
				'site-topic-with-preview' === ownProps.stepName ||
				'site-title-with-preview' === ownProps.stepName,
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

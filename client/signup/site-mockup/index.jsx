/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SignupSitePreview from 'components/signup-site-preview';
import { getPreviewParamClass } from 'components/signup-site-preview/utils';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalName,
	getSiteVerticalPreview,
	getSiteVerticalPreviewScreenshot,
	getSiteVerticalPreviewStyles,
	getSiteVerticalSlug,
} from 'state/signup/steps/site-vertical/selectors';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getThemeCssUri, DEFAULT_FONT_URI as defaultFontUri } from 'lib/signup/site-theme';
import { recordTracksEvent } from 'state/analytics/actions';
import { getLocaleSlug, getLanguage } from 'lib/i18n-utils';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import QueryVerticals from 'components/data/query-verticals';

/**
 * Style dependencies
 */
import './style.scss';

function SiteMockupHelpTip( { siteType } ) {
	const helpTipCopy = getSiteTypePropertyValue( 'slug', siteType, 'siteMockupHelpTipCopy' ) || '';

	return (
		<div className="site-mockup__help-tip">
			<p>{ helpTipCopy }</p>
			<Gridicon icon="chevron-down" />
		</div>
	);
}

function SiteMockupHelpTipBottom( { siteType } ) {
	const helpTipCopy =
		getSiteTypePropertyValue( 'slug', siteType, 'siteMockupHelpTipCopyBottom' ) || '';
	return (
		<div className="site-mockup__help-tip">
			<Gridicon icon="chevron-up" />
			<p>{ helpTipCopy }</p>
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
		verticalPreviewScreenshot: PropTypes.string,
		verticalPreviewStyles: PropTypes.string,
	};

	static defaultProps = {
		siteStyle: '',
		siteType: '',
		stepName: '',
		title: '',
		vertical: '',
		verticalPreviewContent: '',
		verticalPreviewStyles: '',
	};

	shouldComponentUpdate( nextProps ) {
		// Debouncing updates to the preview content
		// prevents the flashing effect.
		if (
			nextProps.verticalPreviewContent !== this.props.verticalPreviewContent ||
			nextProps.verticalPreviewScreenshot !== this.props.verticalPreviewScreenshot
		) {
			this.updateDebounced();
			return false;
		}

		return true;
	}

	updateDebounced = debounce( () => {
		this.forceUpdate();
		if ( this.props.verticalPreviewContent || this.props.verticalPreviewScreenshot ) {
			this.props.recordTracksEvent( 'calypso_signup_site_preview_mockup_rendered', {
				site_type: this.props.siteType,
				vertical_slug: this.props.verticalSlug,
				site_style: this.props.siteStyle || 'default',
			} );
		}
	}, 777 );

	/**
	 * Returns site preview content block interpolated with markup that allows
	 * preview params to be injected with JavaScript.
	 *
	 * @param {string} content Content to format
	 * @returns {string} Formatted content
	 */
	getContent( content = '' ) {
		if ( 'string' !== typeof content ) {
			return content;
		}

		return Object.keys( this.getPreviewParams() ).reduce(
			( currContent, paramName ) =>
				currContent.replace(
					new RegExp( '{{' + paramName + '}}', 'gi' ),
					`<span class="${ getPreviewParamClass( paramName ) }"></span>`
				),
			content
		);
	}

	getPreviewParams() {
		const { title: CompanyName, siteVerticalName } = this.props;
		return {
			CompanyName,
			Address: translate( 'Your Address' ),
			Phone: translate( 'Your Phone Number' ),
			Vertical: siteVerticalName || '',
		};
	}

	handlePreviewClick = ( size ) =>
		this.props.recordTracksEvent( 'calypso_signup_site_preview_mockup_clicked', {
			size,
			vertical_slug: this.props.verticalSlug,
			site_style: this.props.siteStyle || 'default',
		} );

	render() {
		const {
			fontUrl,
			shouldFetchVerticalData,
			shouldShowHelpTip,
			siteStyle,
			siteType,
			siteVerticalName,
			title,
			themeSlug,
			verticalPreviewContent,
			verticalPreviewScreenshot,
			verticalPreviewStyles,
		} = this.props;

		const siteMockupClasses = classNames( 'site-mockup__wrap', {
			'is-empty': isEmpty( verticalPreviewContent ) && ! verticalPreviewScreenshot,
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
				params: this.getPreviewParams(),
			},
			gutenbergStylesUrl: verticalPreviewStyles,
			langSlug,
			isRtl,
			onPreviewClick: this.handlePreviewClick,
			className: siteStyle,
		};

		return (
			<div className={ siteMockupClasses }>
				{ shouldShowHelpTip && <SiteMockupHelpTip siteType={ siteType } /> }
				<div className="site-mockup__devices">
					<SignupSitePreview
						defaultViewportDevice="desktop"
						resize={ true }
						scrolling={ false }
						{ ...otherProps }
					/>
					<SignupSitePreview defaultViewportDevice="phone" { ...otherProps } />
				</div>
				{ shouldShowHelpTip && <SiteMockupHelpTipBottom siteType={ siteType } /> }
				{ shouldFetchVerticalData && (
					<QueryVerticals searchTerm={ siteVerticalName } siteType={ siteType } />
				) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteStyle = getSiteStyle( state );
		const siteType = getSiteType( state );
		const themeSlug = getSiteTypePropertyValue( 'slug', siteType, 'theme' );
		const titleFallback = getSiteTypePropertyValue( 'slug', siteType, 'siteMockupTitleFallback' );
		const verticalPreviewContent = getSiteVerticalPreview( state );
		const shouldFetchVerticalData = ! verticalPreviewContent;
		return {
			title: getSiteTitle( state ) || titleFallback,
			siteStyle,
			siteType,
			verticalPreviewContent,
			// Used to determine whether content has changed, choose any screenshot
			verticalPreviewScreenshot: getSiteVerticalPreviewScreenshot( state, 'desktop' ),
			verticalPreviewStyles: getSiteVerticalPreviewStyles( state ),
			siteVerticalName: getSiteVerticalName( state ),
			verticalSlug: getSiteVerticalSlug( state ),
			shouldShowHelpTip:
				'site-topic-with-preview' === ownProps.stepName ||
				'site-title-with-preview' === ownProps.stepName,
			themeSlug: themeSlug,
			fontUrl: defaultFontUri,
			shouldFetchVerticalData,
		};
	},
	{
		recordTracksEvent,
	}
)( SiteMockups );

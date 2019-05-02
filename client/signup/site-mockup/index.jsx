/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, find, get, isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import SignupSitePreview from 'components/signup-site-preview';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import {
	getSiteVerticalPreview,
	getSiteVerticalPreviewIframeContent,
	getSiteVerticalPreviewLastShown,
	getSiteVerticalSlug,
} from 'state/signup/steps/site-vertical/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { updateSiteMockupDisplayAction } from 'state/signup/steps/site-style/actions';
import { getSiteStyle } from 'state/signup/steps/site-style/selectors';
import { getSiteStyleOptions, getThemeCssUri } from 'lib/signup/site-styles';
import { recordTracksEvent } from 'state/analytics/actions';
import { getLocaleSlug, getLanguage } from 'lib/i18n-utils';

const debug = debugFactory( 'calypso:signup:site-mockup' );

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
		verticalPreview: PropTypes.string,
		verticalPreviewContent: PropTypes.object,
	};

	static defaultProps = {
		address: '',
		phone: '',
		siteStyle: '',
		siteType: '',
		stepName: '',
		title: '',
		vertical: '',
		verticalPreview: '',
		verticalPreviewContent: {},
	};

	debouncedUpdateSiteMockupDisplayAction = debounce(
		this.props.updateSiteMockupDisplayAction,
		300
	);

	componentDidMount() {
		this.props.updateSiteMockupDisplayAction();
	}

	componentDidUpdate( prevProps ) {
		const {
			siteStyle,
			siteType,
			verticalPreview,
			verticalSlug,
			verticalPreviewContent,
		} = this.props;

		if ( prevProps.verticalPreview !== verticalPreview ) {
			this.debouncedUpdateSiteMockupDisplayAction();
			return;
		}

		const body = get( verticalPreviewContent, 'body' );
		if ( body && body !== get( prevProps, 'verticalPreviewContent.body' ) ) {
			this.props.recordTracksEvent( 'calypso_signup_site_preview_mockup_rendered', {
				site_type: siteType,
				vertical_slug: verticalSlug,
				site_style: siteStyle || 'default',
			} );
		}
	}

	handleClick = size => {
		this.props.recordTracksEvent( 'calypso_signup_site_preview_mockup_clicked', {
			size,
			vertical_slug: this.props.verticalSlug,
			site_style: this.props.siteStyle || 'default',
		} );
	};

	render() {
		const {
			fontUrl,
			lastShown,
			shouldShowHelpTip,
			siteStyle,
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
			content: verticalPreviewContent,
			langSlug,
			isRtl,
			onPreviewClick: this.handleClick,
			className: siteStyle,
		};

		debug( 'Rendering SiteMockups component' );

		return (
			<div className={ siteMockupClasses } key={ lastShown }>
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
		const siteInformation = getSiteInformation( state );
		const siteStyle = getSiteStyle( state );
		const siteType = getSiteType( state );
		const styleOptions = getSiteStyleOptions( siteType );
		const style = find( styleOptions, { id: siteStyle || 'professional' } );
		return {
			title: siteInformation.title || translate( 'Your New Website' ),
			address: siteInformation.address,
			lastShown: getSiteVerticalPreviewLastShown( state ), // updates memoized selectors
			phone: siteInformation.phone,
			siteStyle,
			siteType,
			verticalPreview: getSiteVerticalPreview( state ),
			verticalPreviewContent: getSiteVerticalPreviewIframeContent( state ),
			verticalSlug: getSiteVerticalSlug( state ),
			shouldShowHelpTip:
				'site-topic-with-preview' === ownProps.stepName ||
				'site-information-title-with-preview' === ownProps.stepName,
			themeSlug: style.theme,
			fontUrl: style.fontUrl,
		};
	},
	{
		recordTracksEvent,
		updateSiteMockupDisplayAction,
	}
)( SiteMockups );

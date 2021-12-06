import { Card, Ribbon, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isEmpty, isEqual, some } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import PulsingDot from 'calypso/components/pulsing-dot';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import { decodeEntities } from 'calypso/lib/formatting';
import { isFullSiteEditingTheme } from 'calypso/my-sites/themes/is-full-site-editing-theme';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setThemesBookmark } from 'calypso/state/themes/themes-ui/actions';
import ThemeMoreButton from './more-button';

import './style.scss';

const noop = () => {};

export class Theme extends Component {
	static propTypes = {
		theme: PropTypes.shape( {
			// Theme ID (theme-slug)
			id: PropTypes.string.isRequired,
			// Theme name
			name: PropTypes.string.isRequired,
			// Theme screenshot URL
			screenshot: PropTypes.string,
			author: PropTypes.string,
			author_uri: PropTypes.string,
			demo_uri: PropTypes.string,
			stylesheet: PropTypes.string,
			taxonomies: PropTypes.object,
		} ),
		// If true, highlight this theme as active
		active: PropTypes.bool,
		// If true, the theme is being installed
		installing: PropTypes.bool,
		// If true, render a placeholder
		isPlaceholder: PropTypes.bool,
		// URL the screenshot link points to
		screenshotClickUrl: PropTypes.string,
		// Called when theme screenshot is clicked
		onScreenshotClick: PropTypes.func,
		// Called when the more button is clicked
		onMoreButtonClick: PropTypes.func,
		// Options to populate the 'More' button popover menu with
		buttonContents: PropTypes.objectOf(
			PropTypes.shape( {
				label: PropTypes.string,
				header: PropTypes.string,
				action: PropTypes.func,
				getUrl: PropTypes.func,
			} )
		),
		// Index of theme in results list
		index: PropTypes.number,
		// Label to show on screenshot hover.
		actionLabel: PropTypes.string,
		// Translate function,
		translate: PropTypes.func,
		// Themes bookmark items.
		setThemesBookmark: PropTypes.func,
		bookmarkRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.any } ),
		] ),
		blockEditorSettings: PropTypes.shape( {
			is_fse_eligible: PropTypes.bool,
		} ),
	};

	static defaultProps = {
		isPlaceholder: false,
		buttonContents: {},
		onMoreButtonClick: noop,
		actionLabel: '',
		active: false,
	};

	shouldComponentUpdate( nextProps ) {
		return (
			nextProps.theme.id !== this.props.theme.id ||
			nextProps.active !== this.props.active ||
			nextProps.installing !== this.props.installing ||
			! isEqual(
				Object.keys( nextProps.buttonContents ),
				Object.keys( this.props.buttonContents )
			) ||
			nextProps.screenshotClickUrl !== this.props.screenshotClickUrl ||
			nextProps.onScreenshotClick !== this.props.onScreenshotClick ||
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick
		);
	}

	onScreenshotClick = () => {
		const { onScreenshotClick } = this.props;
		if ( typeof onScreenshotClick === 'function' ) {
			onScreenshotClick( this.props.theme.id, this.props.index );
		}
	};

	isBeginnerTheme() {
		const { theme } = this.props;
		const skillLevels = get( theme, [ 'taxonomies', 'theme_skill-level' ] );
		return some( skillLevels, { slug: 'beginner' } );
	}

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card className="theme is-placeholder">
				<div className="theme__content" />
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInstalling() {
		if ( this.props.installing ) {
			return (
				<div className="theme__installing">
					<PulsingDot active={ true } />
				</div>
			);
		}
	}

	setBookmark = () => {
		this.props.setThemesBookmark( this.props.theme.id );
	};

	render() {
		const { active, blockEditorSettings, theme, translate } = this.props;
		const { name, description, screenshot } = theme;
		const isActionable = this.props.screenshotClickUrl || this.props.onScreenshotClick;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': isActionable,
		} );
		const themeDescription = decodeEntities( description );

		// for performance testing
		const screenshotID = this.props.index === 0 ? 'theme__firstscreenshot' : null;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } );
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } );
		const e2eThemeName = name.toLowerCase().replace( /\s+/g, '-' );

		const bookmarkRef = this.props.bookmarkRef ? { ref: this.props.bookmarkRef } : {};
		const isFSEEligible = blockEditorSettings?.is_fse_eligible ?? false;
		const showBetaBadge = isFullSiteEditingTheme( this.props.theme ) && isFSEEligible;

		return (
			<Card className={ themeClass } data-e2e-theme={ e2eThemeName } onClick={ this.setBookmark }>
				{ this.isBeginnerTheme() && (
					<Ribbon className="theme__ribbon" color="green">
						{ translate( 'Beginner' ) }
					</Ribbon>
				) }
				<div className="theme__content" { ...bookmarkRef }>
					<a
						aria-label={ name }
						className="theme__thumbnail"
						href={ this.props.screenshotClickUrl || 'javascript:;' /* fallback for a11y */ }
						onClick={ this.onScreenshotClick }
						title={ themeDescription }
					>
						{ isActionable && (
							<div className="theme__thumbnail-label">{ this.props.actionLabel }</div>
						) }
						{ this.renderInstalling() }
						{ screenshot ? (
							<img
								alt={ themeDescription }
								className="theme__img"
								src={ themeImgSrc }
								srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
								id={ screenshotID }
							/>
						) : (
							<div className="theme__no-screenshot">
								<Gridicon icon="themes" size={ 48 } />
							</div>
						) }
					</a>

					<div className="theme__info">
						<h2 className="theme__info-title">
							{ name }
							{ showBetaBadge && (
								<Badge type="warning-clear" className="theme__badge-beta">
									{ translate( 'Beta' ) }
								</Badge>
							) }
						</h2>
						{ active && (
							<span className="theme__badge-active">
								{ translate( 'Active', {
									context: 'singular noun, the currently active theme',
								} ) }
							</span>
						) }
						{ ! isEmpty( this.props.buttonContents ) ? (
							<ThemeMoreButton
								index={ this.props.index }
								themeId={ this.props.theme.id }
								active={ this.props.active }
								onMoreButtonClick={ this.props.onMoreButtonClick }
								options={ this.props.buttonContents }
							/>
						) : null }
					</div>
				</div>
			</Card>
		);
	}
}

const ThemeWithEditorSettings = withBlockEditorSettings( Theme );

export default connect( null, { recordTracksEvent, setThemesBookmark } )(
	localize( ThemeWithEditorSettings )
);

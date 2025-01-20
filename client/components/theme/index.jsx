import { Card, Button, Gridicon } from '@automattic/components';
import {
	DesignPreviewImage,
	ThemeCard,
	isDefaultGlobalStylesVariationSlug,
} from '@automattic/design-picker';
import { localize } from 'i18n-calypso';
import { isEmpty, isEqual } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
import { isExternallyManagedTheme as getIsExternallyManagedTheme } from 'calypso/state/themes/selectors';
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
			update: PropTypes.object,
			soft_launched: PropTypes.bool,
			isCustomGeneratedTheme: PropTypes.bool,
		} ),
		// If true, highlight this theme as active
		active: PropTypes.bool,
		// If true, highlight this theme in a loading state
		loading: PropTypes.bool,
		// If true, render a placeholder
		isPlaceholder: PropTypes.bool,
		// URL the screenshot link points to
		screenshotClickUrl: PropTypes.string,
		// Called when theme screenshot is clicked
		onScreenshotClick: PropTypes.func,
		// Called when theme style variation is clicked
		onStyleVariationClick: PropTypes.func,
		// Called when the more button is clicked
		onMoreButtonClick: PropTypes.func,
		// Called when a more button item is clicked
		onMoreButtonItemClick: PropTypes.func,
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
		siteId: PropTypes.number,
		isUpdating: PropTypes.bool,
		isUpdated: PropTypes.bool,
		errorOnUpdate: PropTypes.bool,
		softLaunched: PropTypes.bool,
		selectedStyleVariation: PropTypes.object,
		shouldLimitGlobalStyles: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
		buttonContents: {},
		onMoreButtonClick: noop,
		onMoreButtonItemClick: noop,
		actionLabel: '',
		active: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isScreenshotLoaded: false,
		};
	}

	prevThemeThumbnailRef = createRef( null );
	themeThumbnailRef = createRef( null );

	shouldComponentUpdate( nextProps ) {
		const themeThumbnailRefUpdated = this.themeThumbnailRef.current !== this.themeThumbnailRef.prev;
		if ( themeThumbnailRefUpdated ) {
			this.prevThemeThumbnailRef.current = this.themeThumbnailRef.current;
		}

		return (
			nextProps.theme.id !== this.props.theme.id ||
			nextProps.active !== this.props.active ||
			nextProps.loading !== this.props.loading ||
			! isEqual(
				Object.keys( nextProps.buttonContents ),
				Object.keys( this.props.buttonContents )
			) ||
			nextProps.screenshotClickUrl !== this.props.screenshotClickUrl ||
			nextProps.onScreenshotClick !== this.props.onScreenshotClick ||
			nextProps.onStyleVariationClick !== this.props.onStyleVariationClick ||
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick ||
			nextProps.onMoreButtonItemClick !== this.props.onMoreButtonItemClick ||
			themeThumbnailRefUpdated
		);
	}

	onScreenshotClick = () => {
		const { onScreenshotClick } = this.props;
		if ( typeof onScreenshotClick === 'function' ) {
			onScreenshotClick( this.props.theme.id, this.props.index );
		}
	};

	onStyleVariationClick = ( variation ) => {
		this.props.onStyleVariationClick?.( this.props.theme.id, this.props.index, variation );
	};

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card className="theme theme-card is-placeholder">
				<div className="theme__content" />
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderScreenshot() {
		const { isExternallyManagedTheme, selectedStyleVariation, theme, siteSlug, translate } =
			this.props;
		const { isScreenshotLoaded } = this.state;
		const { description, screenshot } = theme;

		if ( theme.isCustomGeneratedTheme ) {
			return (
				<iframe
					scrolling="no"
					loading="lazy"
					title={ translate( 'Custom Theme Preview' ) }
					className="theme__site-preview"
					src={ `//${ siteSlug }/?hide_banners=true&preview_overlay=true&preview=true&cys-hide-admin-bar=1` }
				/>
			);
		}

		if ( ! screenshot ) {
			return (
				<div className="theme__no-screenshot">
					<Gridicon icon="themes" size={ 48 } />
				</div>
			);
		}

		// mShots don't work well with SSR, since it shows a placeholder image by default
		// the snapshot request is completed.
		//
		// With that in mind, we only use mShots for non-default style variations to ensure
		// that there is no flash of image transition from static image to mShots on page load.
		if (
			! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug ) &&
			! isExternallyManagedTheme
		) {
			const { id: themeId, stylesheet } = theme;

			return (
				<DesignPreviewImage
					design={ { slug: themeId, recipe: { stylesheet } } }
					styleVariation={ selectedStyleVariation }
				/>
			);
		}

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } ) || screenshot;
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } ) || screenshot;

		return (
			<img
				loading="lazy"
				alt={ isScreenshotLoaded ? decodeEntities( description ) : '' }
				className="theme__img"
				src={ themeImgSrc }
				srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
				onLoad={ () => {
					this.setState( { isScreenshotLoaded: true } );
				} }
			/>
		);
	}

	onUpsellClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'theme-upsell-popup',
			theme: this.props.theme.id,
		} );
	};

	setBookmark = () => {
		this.props.setThemesBookmark( this.props.theme.id );
	};

	updateTheme = () => {
		this.props.updateThemes( [ this.props.theme.id ], this.props.siteId );
	};

	renderUpdateAlert = () => {
		const { isUpdated, isUpdating, errorOnUpdate, theme, translate } = this.props;

		if ( ! theme.update && ! isUpdated && ! isUpdating && ! errorOnUpdate ) {
			return;
		}

		let content;
		let alertType;

		if ( errorOnUpdate ) {
			alertType = 'danger';
			content = (
				<div>
					<span>
						<Gridicon icon="cross" size={ 18 } />
						{ translate( 'Failed to update Theme.' ) }
					</span>
				</div>
			);
		} else if ( isUpdated ) {
			alertType = 'success';
			content = (
				<div>
					<span>
						<Gridicon icon="checkmark" size={ 18 } />
						{ translate( 'Theme updated!' ) }
					</span>
				</div>
			);
		} else if ( isUpdating ) {
			alertType = 'info';
			content = (
				<div>
					<span>
						<Gridicon className="theme__updating-animated" icon="refresh" size={ 18 } />
						{ translate( 'Updating theme.' ) }
					</span>
				</div>
			);
		} else if ( theme.update ) {
			alertType = 'warning';
			content = (
				<div>
					<span>
						<Gridicon icon="refresh" size={ 18 } />
						{ translate( 'New version available.' ) }
					</span>
					<Button onClick={ this.updateTheme } primary className="theme__button-link" borderless>
						{ translate( 'Update now' ) }
					</Button>
				</div>
			);
		}

		return (
			<div className="theme__update-alert">
				<div className={ `${ alertType } theme__update-alert-content` }>{ content }</div>
			</div>
		);
	};

	renderMoreButton = () => {
		const { active, buttonContents, index, theme, siteId } = this.props;

		let moreOptions;
		if ( active && buttonContents.info ) {
			moreOptions = { info: buttonContents.info };
		} else if ( buttonContents.deleteTheme ) {
			moreOptions = { deleteTheme: buttonContents.deleteTheme };
		} else {
			moreOptions = {};
		}

		if ( isEmpty( moreOptions ) ) {
			return null;
		}

		return (
			<ThemeMoreButton
				index={ index }
				siteId={ siteId }
				themeId={ theme.id }
				themeName={ theme.name }
				hasStyleVariations={ !! theme?.style_variations?.length }
				active={ active }
				onMoreButtonClick={ this.props.onMoreButtonClick }
				onMoreButtonItemClick={ this.props.onMoreButtonItemClick }
				options={ moreOptions }
			/>
		);
	};

	renderBadge = () => {
		const { theme } = this.props;

		return <ThemeTierBadge themeId={ theme.id } />;
	};

	render() {
		const { selectedStyleVariation, theme } = this.props;
		const { name, style_variations = [] } = theme;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		return (
			<ThemeCard
				ref={ this.props.bookmarkRef }
				name={ name }
				image={ this.renderScreenshot() }
				imageClickUrl={ this.props.screenshotClickUrl }
				imageActionLabel={ this.props.actionLabel }
				banner={ this.renderUpdateAlert() }
				badge={ this.renderBadge() }
				styleVariations={ style_variations }
				selectedStyleVariation={ selectedStyleVariation }
				optionsMenu={ this.renderMoreButton() }
				isActive={ this.props.active }
				isLoading={ this.props.loading }
				isSoftLaunched={ this.props.softLaunched }
				onClick={ this.setBookmark }
				onImageClick={ this.onScreenshotClick }
				onStyleVariationClick={ this.onStyleVariationClick }
				onStyleVariationMoreClick={ this.onStyleVariationClick }
			/>
		);
	}
}

const ConnectedTheme = connect(
	( state, { theme, siteId } ) => {
		const {
			themes: { themesUpdate },
		} = state;
		const { themesUpdateFailed, themesUpdating, themesUpdated } = themesUpdate;
		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, theme.id );

		return {
			errorOnUpdate: themesUpdateFailed && themesUpdateFailed.indexOf( theme.id ) > -1,
			isUpdating: themesUpdating && themesUpdating.indexOf( theme.id ) > -1,
			isUpdated: themesUpdated && themesUpdated.indexOf( theme.id ) > -1,
			isExternallyManagedTheme,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ recordTracksEvent, setThemesBookmark, updateThemes }
)( localize( Theme ) );

export default ( props ) => {
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( props.siteId );
	return <ConnectedTheme { ...props } shouldLimitGlobalStyles={ shouldLimitGlobalStyles } />;
};

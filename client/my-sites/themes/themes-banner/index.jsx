/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Button from 'components/button';
import safeImageUrl from 'lib/safe-image-url';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { getActiveTheme, getThemeDetailsUrl } from 'state/themes/selectors';
import { isThemesBannerVisible } from 'state/themes/themes-ui/selectors';
import { hideThemesBanner } from 'state/themes/themes-ui/actions';

class ThemesBanner extends PureComponent {
	static propTypes = {
		themeId: PropTypes.string,
		themeName: PropTypes.string,
		title: PropTypes.node.isRequired,
		description: PropTypes.node.isRequired,
		backgroundColor: PropTypes.string,
		image: PropTypes.string,
		imageWidth: PropTypes.number,
		imageTransform: PropTypes.string,

		// Connected props
		siteId: PropTypes.number,
		themeUrl: PropTypes.string,
		activeThemeId: PropTypes.string,
		isBannerVisible: PropTypes.bool,
		onBannerClose: PropTypes.func,
	};

	recordEvent = () => {
		const { activeThemeId, recordTracksEvent, siteId, themeId } = this.props;
		const tracksData = {
			site_id: siteId,
			theme: themeId,
			active_theme: activeThemeId,
		};
		recordTracksEvent( 'calypso_showcase_banner_click', tracksData );
	};

	onBannerCloseClick = e => {
		this.props.onBannerClose();
		e.preventDefault();
	};

	render() {
		const {
			title,
			description,
			backgroundColor,
			image,
			imageWidth,
			imageTransform = 'auto',
			isBannerVisible,
			themeName,
			themeUrl,
			translate,
		} = this.props;
		if ( ! isBannerVisible ) {
			return null; // Do not show banner if the user has closed it.
		}
		const backgroundStyle = backgroundColor ? { backgroundColor } : {};
		return (
			<a
				className="themes-banner"
				role="button"
				style={ backgroundStyle }
				onClick={ this.recordEvent }
				href={ themeUrl }
			>
				<h1 className="themes-banner__title">{ title }</h1>
				<p className="themes-banner__description">{ description }</p>
				<Button className="themes-banner__cta" compact primary>
					{ translate( 'See the theme' ) }
				</Button>
				<button className="themes-banner__close" type="button" onClick={ this.onBannerCloseClick }>
					<Gridicon icon="cross-small" size={ 18 } />
				</button>
				{ image && (
					<img
						alt={ translate( '%(themeName)s Theme', {
							args: { themeName },
						} ) }
						width={ imageWidth }
						className="themes-banner__image"
						src={ safeImageUrl( image ) }
						style={ { transform: imageTransform } }
					/>
				) }
			</a>
		);
	}
}

const mapStateToProps = ( state, { themeId } ) => {
	const siteId = getSelectedSiteId( state );
	const themeUrl = getThemeDetailsUrl( state, themeId, siteId );
	const activeThemeId = getActiveTheme( state, siteId );
	const isBannerVisible = isThemesBannerVisible( state );
	return {
		siteId,
		themeUrl,
		activeThemeId,
		isBannerVisible,
	};
};

const mapDispatchToProps = dispatch => ( {
	recordTracksEvent: recordTracksEventAction,
	onBannerClose: () => dispatch( hideThemesBanner ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ThemesBanner ) );

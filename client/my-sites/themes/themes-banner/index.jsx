/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Button from 'components/button';
import safeImageUrl from 'lib/safe-image-url';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getActiveTheme, getThemeDetailsUrl } from 'state/themes/selectors';

class ThemesBanner extends PureComponent {
	static propTypes = {
		themeId: PropTypes.string,
		themeName: PropTypes.string,
		title: PropTypes.node.isRequired,
		description: PropTypes.node.isRequired,
		buttonLabel: PropTypes.string.isRequired,
		backgroundColor: PropTypes.string,
		image: PropTypes.string,
		imageAttrs: PropTypes.shape( {
			width: PropTypes.number,
		} ),
		imageTransform: PropTypes.string,

		// Connected props
		siteId: PropTypes.number,
		themeUrl: PropTypes.string,
		activeThemeId: PropTypes.string,
	};

	onClick = () => {
		const { siteId, themeId, activeThemeId } = this.props;
		const tracksData = {
			site_id: siteId,
			theme: themeId,
			active_theme: activeThemeId,
		};
		recordTracksEvent( 'calypso_showcase_banner_click', tracksData );
	};

	render() {
		const {
			title,
			description,
			buttonLabel,
			backgroundColor,
			image,
			imageAttrs = {},
			imageTransform = 'auto',
			themeName,
			themeUrl,
			translate,
		} = this.props;
		const backgroundStyle = backgroundColor ? { backgroundColor } : {};
		const imageNode = image ? (
			<img
				{ ...imageAttrs }
				alt={ translate( '%(themeName)s Theme', {
					args: { themeName },
				} ) }
				className="themes-banner__image"
				src={ safeImageUrl( image ) }
				style={ { transform: imageTransform } }
			/>
		) : null;
		return (
			<a
				className="themes-banner"
				role="button"
				style={ backgroundStyle }
				onClick={ this.onClick }
				href={ themeUrl }
			>
				<h1 className="themes-banner__title">{ title }</h1>
				<p className="themes-banner__description">{ description }</p>
				<Button className="themes-banner__cta" compact primary>
					{ buttonLabel }
				</Button>
				{ imageNode }
			</a>
		);
	}
}

const mapStateToProps = ( state, { themeId } ) => {
	const siteId = getSelectedSiteId( state );
	const themeUrl = getThemeDetailsUrl( state, themeId, siteId );
	const activeThemeId = getActiveTheme( state, siteId );
	return {
		siteId,
		themeUrl,
		activeThemeId,
	};
};

export default connect( mapStateToProps )( localize( ThemesBanner ) );

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { defer, mapValues, omit } from 'lodash';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import SiteSelectorModal from 'components/site-selector-modal';
import { trackClick } from './helpers';
import { getSiteSlug } from 'state/sites/selectors';
import { getTheme } from 'state/themes/selectors';

/**
 * Style dependencies
 */
import './themes-site-selector-modal.scss';

const OPTION_SHAPE = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func,
} );

class ThemesSiteSelectorModal extends React.Component {
	static propTypes = {
		children: PropTypes.element,
		options: PropTypes.objectOf( OPTION_SHAPE ),
		defaultOption: OPTION_SHAPE,
		secondaryOption: OPTION_SHAPE,
		// Will be prepended to site slug for a redirect on selection
		pathName: PropTypes.string.isRequired,
		// connected props
		getSiteSlug: PropTypes.func,
		getWpcomTheme: PropTypes.func,
	};

	state = {
		selectedThemeId: null,
		selectedOption: null,
	};

	trackAndCallAction = ( siteId ) => {
		const action = this.state.selectedOption.action;
		const themeId = this.state.selectedThemeId;
		const { search } = this.props;
		const siteSlug = this.props.getSiteSlug( siteId );

		let redirectTarget = this.props.pathName + '/' + siteSlug;
		if ( search ) {
			redirectTarget += '?s=' + search;
		}

		trackClick( 'site selector', this.props.name );
		page( redirectTarget );

		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setselectedThemeId.
		 */
		if ( action ) {
			defer( () => {
				action( themeId, siteId );
			} );
		}
	};

	showSiteSelectorModal = ( option, themeId ) => {
		this.setState( { selectedThemeId: themeId, selectedOption: option } );
	};

	hideSiteSelectorModal = () => {
		this.showSiteSelectorModal( null, null );
	};

	/*
	 * Wrap an option's action with a SiteSelectorModal.
	 * Also, if the option has a getUrl() prop, wrap that with a SiteSelectorModal
	 * but only if it also has a header, because the latter indicates it really needs
	 * a site to be selected and doesn't work otherwise.
	 */
	wrapOption = ( option ) => {
		return Object.assign(
			{},
			option,
			option.header ? { action: ( themeId ) => this.showSiteSelectorModal( option, themeId ) } : {},
			option.getUrl && option.header ? { getUrl: null } : {}
		);
	};

	render() {
		const children = React.cloneElement(
			this.props.children,
			Object.assign( {}, omit( this.props, [ 'children', 'options', 'defaultOption' ] ), {
				options: mapValues( this.props.options, this.wrapOption ),
				defaultOption: this.wrapOption( this.props.defaultOption ),
				secondaryOption: this.props.secondaryOption
					? this.wrapOption( this.props.secondaryOption )
					: null,
			} )
		);

		const { selectedOption, selectedThemeId } = this.state;
		const theme = this.props.getWpcomTheme( selectedThemeId );

		return (
			<div>
				{ children }
				{ selectedOption && (
					<SiteSelectorModal
						className="themes__site-selector-modal"
						isVisible={ true }
						filter={ function ( siteId ) {
							return ! (
								selectedOption.hideForTheme &&
								selectedOption.hideForTheme( selectedThemeId, siteId )
							);
						} }
						hide={ this.hideSiteSelectorModal }
						mainAction={ this.trackAndCallAction }
						mainActionLabel={ selectedOption.label }
						getMainUrl={
							selectedOption.getUrl
								? function ( siteId ) {
										return selectedOption.getUrl( selectedThemeId, siteId );
								  }
								: null
						}
					>
						<Theme isActionable={ false } theme={ theme } />
						<h1>{ selectedOption.header }</h1>
					</SiteSelectorModal>
				) }
			</div>
		);
	}
}

const bindGetSiteSlug = ( state ) => ( siteId ) => getSiteSlug( state, siteId );
const bindGetWpcomTheme = ( state ) => ( themeId ) => getTheme( state, 'wpcom', themeId );

export default connect( ( state ) => ( {
	// We don't need a <QueryTheme /> component to fetch data for the theme since the
	// ThemesSiteSelectorModal will always be called from a context where those data are available.
	// FIXME: Since the siteId and themeId are part of the component's internal state, we can't use them
	// here. Instead, we have to return helper functions.
	getSiteSlug: bindGetSiteSlug( state ),
	getWpcomTheme: bindGetWpcomTheme( state ),
} ) )( ThemesSiteSelectorModal );

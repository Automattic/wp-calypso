/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import defer from 'lodash/defer';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import SiteSelectorModal from 'components/site-selector-modal';
import { trackClick } from './helpers';
import { getTheme } from 'state/themes/selectors';

const OPTION_SHAPE = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func
} );

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		children: PropTypes.element,
		options: PropTypes.objectOf( OPTION_SHAPE ),
		defaultOption: OPTION_SHAPE,
		secondaryOption: OPTION_SHAPE,
		// Will be prepended to site slug for a redirect on selection
		sourcePath: PropTypes.string.isRequired,
	},

	getInitialState() {
		return {
			selectedTheme: null,
			selectedOption: null,
		};
	},

	trackAndCallAction( site ) {
		const action = this.state.selectedOption.action;
		const theme = this.state.selectedTheme;

		trackClick( 'site selector', this.props.name );
		page( this.props.sourcePath + '/' + site.slug );

		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		if ( action ) {
			defer( () => {
				action( theme, site.ID );
			} );
		}
	},

	showSiteSelectorModal( option, theme ) {
		this.setState( { selectedTheme: theme, selectedOption: option } );
	},

	hideSiteSelectorModal() {
		this.showSiteSelectorModal( null, null );
	},

	/*
	 * Wrap an option's action with a SiteSelectorModal.
	 * Also, if the option has a getUrl() prop, wrap that with a SiteSelectorModal
	 * but only if it also has a header, because the latter indicates it really needs
	 * a site to be selected and doesn't work otherwise.
	 */
	wrapOption( option ) {
		return Object.assign(
			{},
			option,
			option.header
				? { action: themeId => this.showSiteSelectorModal( option, themeId ) }
				: {},
			option.getUrl && option.header
				? { getUrl: null }
				: {},
		);
	},

	render() {
		const children = React.cloneElement(
			this.props.children,
			Object.assign( {}, omit( this.props, [ 'children', 'options', 'defaultOption' ] ), {
				options: mapValues( this.props.options, this.wrapOption ),
				defaultOption: this.wrapOption( this.props.defaultOption ),
				secondaryOption: this.props.secondaryOption ? this.wrapOption( this.props.secondaryOption ) : null,
			} )
		);

		const { selectedOption, selectedTheme } = this.state;
		const theme = this.props.getWpcomTheme( selectedTheme );

		return (
			<div>
				{ children }
				{ selectedOption && <SiteSelectorModal className="themes__site-selector-modal"
					isVisible={ true }
					filter={ function( site ) {
						return ! (
							( selectedOption.hideForSite && selectedOption.hideForSite( site.ID ) ) ||
							( selectedOption.hideForTheme && selectedOption.hideForTheme( selectedTheme, site.ID ) )
						);
					} }
					hide={ this.hideSiteSelectorModal }
					mainAction={ this.trackAndCallAction }
					mainActionLabel={ selectedOption.label }
					getMainUrl={ selectedOption.getUrl ? function( site ) {
						return selectedOption.getUrl( selectedTheme, site.ID );
					} : null } >

					<Theme isActionable={ false } theme={ theme } />
					<h1>{ selectedOption.header }</h1>
				</SiteSelectorModal> }
			</div>
		);
	}
} );

export default connect(
	( state ) => ( {
		// We don't need a <QueryTheme /> component to fetch data for the theme since the
		// ThemesSiteSelectorModal will always be called from a context where those data are available.
		// FIXME: Since the themeId is part of the component's internal state, we can't use it here and
		// have to return a function instead of a ready-made theme object.
		getWpcomTheme: themeId => getTheme( state, 'wpcom', themeId )
	} )
)( ThemesSiteSelectorModal );

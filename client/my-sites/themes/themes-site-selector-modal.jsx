/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
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

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		options: React.PropTypes.objectOf( React.PropTypes.shape( {
			label: React.PropTypes.string,
			header: React.PropTypes.string,
			action: React.PropTypes.func
		} ) ),
		selectedSite: React.PropTypes.object,
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
				action( theme, site );
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
			option.action || ( option.getUrl && option.header )
				? { action: theme => this.showSiteSelectorModal( option, theme ) }
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

		return (
			<div>
				{ children }
				{ selectedOption && <SiteSelectorModal className="themes__site-selector-modal"
					isVisible={ true }
					filter={ function( site ) {
						return ! site.jetpack;
					} /* No Jetpack sites for now. */ }
					hide={ this.hideSiteSelectorModal }
					mainAction={ this.trackAndCallAction }
					mainActionLabel={ selectedOption.label }
					getMainUrl={ selectedOption.getUrl ? function( site ) {
						return selectedOption.getUrl( selectedTheme, site );
					} : null } >

					<Theme isActionable={ false } theme={ selectedTheme } />
					<h1>{ selectedOption.header }</h1>
				</SiteSelectorModal> }
			</div>
		);
	}
} );

export default ThemesSiteSelectorModal;

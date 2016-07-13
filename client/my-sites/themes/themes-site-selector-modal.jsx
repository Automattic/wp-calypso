/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import defer from 'lodash/defer';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
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
			selectedTheme: {},
			selectedOption: {},
		};
	},

	redirectAndCallAction( site ) {
		const action = this.state.selectedOption.action;
		const theme = this.state.selectedTheme;
		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		defer( () => {
			trackClick( 'site selector', this.props.name );
			page( this.props.sourcePath + '/' + site.slug );
			action( theme, site );
		} );
	},

	showSiteSelectorModal( option, theme ) {
		this.setState( { selectedTheme: theme, selectedOption: option } );
	},

	hideSiteSelectorModal() {
		this.showSiteSelectorModal( {}, {} );
	},

	isThemeOrActionSet() {
		return ! isEmpty( this.state.selectedTheme ) || ! isEmpty( this.state.selectedOption );
	},

	wrapOption( option ) {
		return Object.assign(
			{},
			option,
			option.action
				? { action: theme => this.showSiteSelectorModal( option, theme ) }
				: {}
		);
	},

	render() {
		const wrappedDefaultOption = this.wrapOption( this.props.defaultOption );
		const wrappedOptions = mapValues( this.props.options, this.wrapOption );

		const children = React.cloneElement(
			this.props.children,
			Object.assign( {}, omit( this.props, [ 'children', 'options', 'defaultOption' ] ), {
				options: wrappedOptions,
				defaultOption: wrappedDefaultOption
			} )
		);

		const {
			label,
			header
		} = this.state.selectedOption;

		return (
			<div>
				{ children }
				{ this.isThemeOrActionSet() && <SiteSelectorModal className="themes__site-selector-modal"
					isVisible={ true }
					filter={ function( site ) {
						return ! site.jetpack;
					} /* No Jetpack sites for now. */ }
					hide={ this.hideSiteSelectorModal }
					mainAction={ this.redirectAndCallAction }
					mainActionLabel={ label }>

					<Theme isActionable={ false } theme={ this.state.selectedTheme } />
					<h1>{ header }</h1>
				</SiteSelectorModal> }
			</div>
		);
	}
} );

export default ThemesSiteSelectorModal;

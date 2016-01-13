/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import defer from 'lodash/function/defer';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import SiteSelectorModal from 'components/site-selector-modal';
import Helper from 'lib/themes/helpers';

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		selectedAction: React.PropTypes.objectOf(
			React.PropTypes.shape( {
				label: React.PropTypes.string.isRequired,
				header: React.PropTypes.string.isRequired
			} )
		).isRequired,
		selectedTheme: PropTypes.object.isRequired,
		onHide: PropTypes.func,
		actions: PropTypes.object
	},

	redirectAndCallAction( site ) {
		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		defer( () => {
			const {
				selectedAction: action,
				selectedTheme: theme
			} = this.props;
			Helper.trackClick( 'site selector', action.name );
			page( '/design/' + site.slug );
			this.props.actions[ action.name ]( theme, site );
		} );
	},

	render() {
		const {
			selectedTheme: theme,
			onHide
		} = this.props;
		const { label, header } = this.props.selectedAction;

		return (
			<SiteSelectorModal className="themes__site-selector-modal"
				isVisible={ true }
				filter={ function( site ) {
					return ! site.jetpack;
				} /* No Jetpack sites for now. */ }
				hide={ onHide }
				mainAction={ this.redirectAndCallAction }
				mainActionLabel={ label }>

				<Theme isActionable={ false } { ...theme } />
				<h1>{ header }</h1>
			</SiteSelectorModal>
		);
	}
} );

export default ThemesSiteSelectorModal;
